import { Router } from "express";

import {

  defaultEmergencyContacts,

  defaultEmergencyLocation,

} from "../../../lib/emergency-defaults.js";

import { isDemoMode } from "../config/database.js";

import { env } from "../config/env.js";

import type { AuthRequest } from "../middleware/auth.js";

import { optionalAuth, requireAuth } from "../middleware/auth.js";

import { EmergencyAlert, Notification } from "../models/Clinical.js";

import { sendEmergencyEmail, isEmailConfigured } from "../services/email.service.js";

import { emitBroadcast, emitToUser } from "../services/socket.service.js";

import { isSmsConfigured, normalizePhone, sendEmergencySms } from "../services/sms.service.js";



const router = Router();



type DeliveryStatus = "sent" | "failed" | "skipped" | "simulated";



interface ContactInput {

  name: string;

  relation: string;

  phone: string;

  email?: string;

}



interface ChannelDelivery {

  channel: "sms" | "email" | "push" | "simulated";

  status: DeliveryStatus;

  recipient?: string;

  contactName?: string;

  detail: string;

}



function resolveContacts(req: AuthRequest): ContactInput[] {

  const saved = req.user?.emergencyContacts ?? [];

  if (saved.length > 0) {

    return saved.map((c) => ({

      name: c.name,

      relation: c.relation,

      phone: c.phone,

    }));

  }

  return defaultEmergencyContacts;

}



function resolveEmail(contact: ContactInput): string | undefined {

  if (contact.email) return contact.email;

  if (contact.phone.includes("@")) return contact.phone;

  return undefined;

}



function buildNotified(contacts: ContactInput[], deliveries: ChannelDelivery[]) {

  const notified: Array<{

    type: "caretaker" | "physician" | "dispatch";

    name: string;

    channel: "sms" | "email" | "push" | "simulated";

  }> = [];



  for (const d of deliveries) {

    if (d.status === "skipped") continue;

    const name = d.contactName ?? "Contact";

    if (d.channel === "sms") {

      notified.push({

        type: name.includes("Hospital") ? "dispatch" : "caretaker",

        name,

        channel: "sms",

      });

    } else if (d.channel === "email") {

      notified.push({

        type: name.includes("Dr.") ? "physician" : "caretaker",

        name,

        channel: "email",

      });

    } else if (d.channel === "simulated") {

      notified.push({ type: "dispatch", name: "City General Hospital", channel: "simulated" });

    }

  }



  if (notified.length === 0) {

    const caretaker = contacts[0];

    const physician = contacts[1];

    const hospital = contacts[2];

    if (caretaker) {

      notified.push({ type: "caretaker", name: caretaker.name, channel: "push" });

    }

    if (physician) {

      notified.push({ type: "physician", name: physician.name, channel: "email" });

    }

    if (hospital) {

      notified.push({ type: "dispatch", name: hospital.name, channel: "simulated" });

    }

  }



  return notified;

}



function buildSimulationDeliveries(): ChannelDelivery[] {

  return [

    {

      channel: "sms",

      status: "simulated",

      contactName: defaultEmergencyContacts[0]?.name,

      detail: "SMS simulation only — configure Twilio or log in with API running",

    },

    {

      channel: "email",

      status: "simulated",

      contactName: defaultEmergencyContacts[1]?.name,

      detail: "Email simulation only — configure SMTP in .env.local",

    },

    {

      channel: "simulated",

      status: "simulated",

      contactName: "Emergency services",

      detail: "911 dispatch is always simulation only — call emergency services directly",

    },

  ];

}



router.get("/status", optionalAuth, (_req: AuthRequest, res) => {

  return res.json({

    apiConnected: true,

    authenticated: Boolean(_req.userId),

    email: {

      configured: isEmailConfigured(),

      ready: isEmailConfigured(),

    },

    sms: {

      configured: isSmsConfigured(),

      ready: isSmsConfigured(),

      trialNote: isSmsConfigured()

        ? env.emergencySmsTo

          ? `SMS routed to EMERGENCY_SMS_TO (${env.emergencySmsTo}) for Twilio trial testing.`

          : "Twilio trial accounts may only SMS verified numbers."

        : "Add TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER to .env.local.",

    },

    dispatch: {

      configured: false,

      mode: "simulation_only" as const,

    },

  });

});



router.get("/", requireAuth, async (req: AuthRequest, res) => {

  if (isDemoMode() || !req.user) {

    return res.json({ alerts: [] });

  }



  const alerts = await EmergencyAlert.find({ userId: req.user._id })

    .sort({ createdAt: -1 })

    .limit(20);



  return res.json({

    alerts: alerts.map((a) => ({

      id: a._id.toString(),

      type: a.type,

      message: a.message,

      location: a.location,

      status: a.status,

      createdAt: a.createdAt.toISOString(),

    })),

  });

});



router.post("/", optionalAuth, async (req: AuthRequest, res) => {

  const authenticated = Boolean(req.userId);

  const message = String(req.body.message ?? "Emergency SOS triggered from MediNova");

  const location = req.body.location ?? defaultEmergencyLocation;

  const contacts = resolveContacts(req);

  const deliveries: ChannelDelivery[] = [];

  let alertId: string | undefined;



  if (!authenticated) {

    const simulated = buildSimulationDeliveries();

    return res.json({

      success: true,

      simulation: true,

      demoMode: true,

      authenticated: false,

      message: "Emergency alert simulation (log in + configure Twilio/SMTP for real delivery).",

      location,

      notified: buildNotified(contacts, simulated),

      deliveries: simulated,

    });

  }



  if (!isDemoMode() && req.user) {

    const alert = await EmergencyAlert.create({

      userId: req.user._id,

      type: req.body.type ?? "sos",

      message,

      location: location.address,

      status: "sent",

    });

    alertId = alert._id.toString();



    await Notification.create({

      userId: req.user._id,

      title: "Emergency alert sent",

      body: message,

      type: "emergency",

      urgent: true,

    });

  }



  const locationLine = `${location.address} (${location.lat}, ${location.lng})`;

  const smsBody = `MediNova SOS ALERT: ${message}\nLocation: ${locationLine}\nReply if you can assist.`;

  const emailBody = `${message}\n\nShared location: ${locationLine}`;



  let smsSentToCaretaker = false;



  for (const contact of contacts) {

    const email = resolveEmail(contact);

    if (email) {

      const result = await sendEmergencyEmail(email, emailBody);

      deliveries.push({

        channel: "email",

        status: result.sent ? "sent" : result.preview ? "skipped" : "failed",

        recipient: email,

        contactName: contact.name,

        detail: result.detail ?? (result.sent ? "Email delivered" : "Email not sent"),

      });

    }



    const phone = contact.phone;

    const normalized = normalizePhone(phone);

    const isEmergencyLine = phone.replace(/\D/g, "") === "911";



    if (normalized && !isEmergencyLine) {

      const isCaretaker =

        contact.relation.toLowerCase().includes("caretaker") ||

        contact === contacts[0];



      if (isCaretaker && !smsSentToCaretaker) {

        const result = await sendEmergencySms(phone, smsBody);

        deliveries.push({

          channel: "sms",

          status: result.sent ? "sent" : result.preview ? "skipped" : "failed",

          recipient: env.emergencySmsTo || normalized,

          contactName: contact.name,

          detail: result.detail,

        });

        smsSentToCaretaker = true;

      }

    }

  }



  deliveries.push({

    channel: "simulated",

    status: "simulated",

    contactName: "Emergency services",

    detail: "911 / ambulance dispatch is simulation only — call your local emergency number for real help",

  });



  deliveries.push({

    channel: "push",

    status: "simulated",

    contactName: contacts[0]?.name ?? "Caretaker",

    detail: "Push notification simulated in UI (no mobile app connected)",

  });



  if (req.userId) {

    emitBroadcast("emergency:alert", {

      userId: req.userId,

      message,

      location,

    });

    emitToUser(req.userId, "notification", {

      title: "Emergency alert sent",

      body: message,

      urgent: true,

    });

  }



  const anyReal = deliveries.some((d) => d.status === "sent");



  return res.json({

    success: true,

    simulation: !anyReal,

    demoMode: isDemoMode(),

    authenticated: true,

    message: anyReal

      ? "Emergency alert recorded. Real notifications sent where configured."

      : "Emergency alert recorded. Configure Twilio/SMTP in .env.local for real SMS and email.",

    location,

    notified: buildNotified(contacts, deliveries),

    deliveries,

    alertId,

  });

});



export default router;


