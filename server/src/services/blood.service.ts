import crypto from "crypto";
import {
  BloodRequest,
  Donor,
  BloodEmergencyAlert,
  BloodStock,
  type BloodGroup,
} from "../models/BloodBank.js";
import { nearest, rankByDistance, type GeoPoint } from "./location.service.js";
import { priorityScore } from "./priority.service.js";
import { emitBroadcast, emitToUser } from "./socket.service.js";
import { generateAIResponse, parseJsonFromAI } from "./ai.service.js";

export async function createBloodEmergencyRequest(input: {
  userId: string;
  patientName: string;
  bloodGroup: BloodGroup;
  unitsNeeded: number;
  hospital: string;
  urgency: "normal" | "urgent" | "critical";
  contactPhone: string;
  contactEmail?: string;
  location: GeoPoint;
  notes?: string;
}) {
  const donors = await Donor.find({
    bloodGroup: input.bloodGroup,
    isAvailable: true,
    lat: { $exists: true },
    lng: { $exists: true },
  });

  const ranked = rankByDistance(input.location, donors).slice(0, 15);
  const matchedIds = ranked.map((r) => r.item._id);

  const urgencyBoost =
    input.urgency === "critical" ? 90 : input.urgency === "urgent" ? 70 : 40;
  const aiScore = Math.min(100, urgencyBoost + input.unitsNeeded * 5);

  const request = await BloodRequest.create({
    userId: input.userId,
    patientName: input.patientName,
    bloodGroup: input.bloodGroup,
    unitsNeeded: input.unitsNeeded,
    hospital: input.hospital,
    urgency: input.urgency,
    status: matchedIds.length > 0 ? "matched" : "pending",
    priorityCategory: "emergency_blood",
    aiUrgencyScore: aiScore,
    matchedDonorIds: matchedIds,
    contactPhone: input.contactPhone,
    contactEmail: input.contactEmail,
    donorResponses: matchedIds.map((id) => ({ donorId: id, response: "pending" as const })),
    notes: input.notes,
    lat: input.location.lat,
    lng: input.location.lng,
  });

  if (input.urgency !== "normal") {
    const alert = await BloodEmergencyAlert.create({
      requestId: request._id,
      bloodGroup: input.bloodGroup,
      message: `Emergency ${input.bloodGroup} blood needed at ${input.hospital}`,
      urgency: input.urgency,
    });

    emitBroadcast("bloodbank:emergency", {
      alertId: alert._id.toString(),
      requestId: request._id.toString(),
      bloodGroup: input.bloodGroup,
      message: alert.message,
      urgency: input.urgency,
      priorityScore: priorityScore("emergency_blood", request.createdAt, aiScore),
    });
  }

  for (const { item: donor } of ranked.slice(0, 5)) {
    if (donor.userId) {
      emitToUser(donor.userId.toString(), "notification", {
        title: "Urgent blood donation needed",
        body: `${input.bloodGroup} needed at ${input.hospital} (${ranked.find((r) => r.item._id.equals(donor._id))?.distanceKm.toFixed(1)} km)`,
        urgent: true,
      });
    }
  }

  emitBroadcast("bloodbank:request", {
    requestId: request._id.toString(),
    bloodGroup: input.bloodGroup,
    status: request.status,
    priorityScore: priorityScore("emergency_blood", request.createdAt, aiScore),
  });

  return { request, matchedDonors: ranked };
}

export async function donorRespondToRequest(
  donorId: string,
  requestId: string,
  response: "accepted" | "rejected"
) {
  const request = await BloodRequest.findById(requestId);
  if (!request) throw new Error("Blood request not found");

  const donor = await Donor.findById(donorId);
  if (!donor) throw new Error("Donor not found");

  const idx = request.donorResponses.findIndex((r) =>
    r.donorId.equals(donor._id)
  );
  if (idx >= 0) {
    request.donorResponses[idx].response = response;
    request.donorResponses[idx].respondedAt = new Date();
  } else {
    request.donorResponses.push({
      donorId: donor._id,
      response,
      respondedAt: new Date(),
    });
  }

  if (response === "accepted") {
    request.status = "accepted";
    request.acceptedDonorId = donor._id;
    donor.isAvailable = false;
    await donor.save();

    emitToUser(request.userId.toString(), "notification", {
      title: "Donor accepted your request",
      body: `${donor.name} (${donor.bloodGroup}) is responding to your emergency request`,
      urgent: true,
    });
  }

  await request.save();

  emitBroadcast("bloodbank:request", {
    requestId: request._id.toString(),
    status: request.status,
    donorResponse: response,
  });

  return request;
}

export async function registerDonor(input: {
  userId: string;
  name: string;
  email: string;
  phone: string;
  bloodGroup: BloodGroup;
  city: string;
  location: GeoPoint;
}) {
  const existing = await Donor.findOne({ email: input.email.toLowerCase() });
  if (existing) throw new Error("Donor already registered with this email");

  const donor = await Donor.create({
    userId: input.userId,
    name: input.name,
    email: input.email.toLowerCase(),
    phone: input.phone,
    bloodGroup: input.bloodGroup,
    city: input.city,
    lat: input.location.lat,
    lng: input.location.lng,
    isAvailable: true,
    rewardPoints: 100,
    qrCodeId: `DONOR-${crypto.randomBytes(6).toString("hex").toUpperCase()}`,
  });

  return donor;
}

export async function predictBloodDemand() {
  const stocks = await BloodStock.find();
  const requests = await BloodRequest.find({
    createdAt: { $gte: new Date(Date.now() - 30 * 86400000) },
  });

  const ai = await generateAIResponse(
    'Return JSON: {"predictions":[{"bloodGroup":"O+","demandTrend":"rising|stable|falling","recommendedUnits":number}],"insights":"..."}',
    `Stock: ${JSON.stringify(stocks.map((s) => ({ bg: s.bloodGroup, units: s.units })))}. Requests (30d): ${requests.length}`
  );

  return parseJsonFromAI(ai.content, { predictions: [], insights: "" });
}
