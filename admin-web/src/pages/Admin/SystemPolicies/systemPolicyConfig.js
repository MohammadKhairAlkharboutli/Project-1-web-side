export const DEFAULT_SYSTEM_POLICIES = {
  cancelBeforeDays: 2,
  lateCancelPenaltyPercent: 30,
  maxNoShowCount: 3,
  initialVisitDuration: 30,
  returnVisitDuration: 20,
  consultationDuration: 20,
  followUpDuration: 10,
  operationDuration: 45,
  defaultDuration: 15,
  checkinBeforeHours: 1,
  referralFollowUpExpirationDays: 14,
  referralExternalExpirationDays: 30,
};

function range(start, end, step = 1) {
  const values = [];

  for (let value = start; value <= end; value += step) {
    values.push(value);
  }

  return values;
}

const dayOptions = range(0, 14);
const expirationOptions = range(1, 90);
const percentOptions = range(0, 100, 5);
const noShowOptions = range(1, 10);
const checkinHourOptions = range(0, 12);
const visitDurationOptions = range(5, 120, 5);
const queueDurationOptions = [1, ...range(5, 180, 5)];

export const SYSTEM_POLICY_SECTIONS = [
  {
    id: "cancellation",
    title: "Cancellation and refunds",
    description:
      "Rules used when patients cancel appointments and refunds are calculated.",
    fields: [
      {
        key: "cancelBeforeDays",
        label: "Full refund window",
        description:
          "Patients can cancel this many days before an appointment and keep the full refund.",
        unit: "days",
        hint: "Minimum 0 days.",
        options: dayOptions,
      },
      {
        key: "lateCancelPenaltyPercent",
        label: "Late cancellation penalty",
        description:
          "Penalty percentage taken from payment when a patient cancels too late.",
        unit: "%",
        hint: "Allowed range is 0 to 100 percent.",
        options: percentOptions,
      },
    ],
  },
  {
    id: "no-shows",
    title: "No-show rules",
    description:
      "Controls when repeated missed appointments can suspend a patient account.",
    fields: [
      {
        key: "maxNoShowCount",
        label: "No-show suspension threshold",
        description:
          "Number of no-shows a patient can reach before the account is suspended.",
        unit: "no-shows",
        hint: "Minimum 1 no-show.",
        options: noShowOptions,
      },
    ],
  },
  {
    id: "appointment-durations",
    title: "Appointment durations",
    description:
      "Default appointment lengths used for booking and future scheduling behavior.",
    fields: [
      {
        key: "initialVisitDuration",
        label: "Initial visit duration",
        description: "Expected duration for a first visit appointment.",
        unit: "minutes",
        hint: "Minimum 5 minutes.",
        options: visitDurationOptions,
      },
      {
        key: "returnVisitDuration",
        label: "Return visit duration",
        description: "Expected duration for a returning patient visit.",
        unit: "minutes",
        hint: "Minimum 5 minutes.",
        options: visitDurationOptions,
      },
    ],
  },
  {
    id: "queue",
    title: "Queue and check-in",
    description:
      "Expected consultation times used by queue estimates and check-in windows.",
    fields: [
      {
        key: "consultationDuration",
        label: "Consultation duration",
        description: "Expected duration for a normal consultation in the queue.",
        unit: "minutes",
        hint: "Minimum 1 minute.",
        options: queueDurationOptions,
      },
      {
        key: "followUpDuration",
        label: "Follow-up duration",
        description: "Expected duration for follow-up queue items.",
        unit: "minutes",
        hint: "Minimum 1 minute.",
        options: queueDurationOptions,
      },
      {
        key: "operationDuration",
        label: "Operation duration",
        description: "Expected duration for operation-type queue items.",
        unit: "minutes",
        hint: "Minimum 1 minute.",
        options: queueDurationOptions,
      },
      {
        key: "defaultDuration",
        label: "Fallback duration",
        description:
          "Used when an appointment type does not have a more specific duration.",
        unit: "minutes",
        hint: "Minimum 1 minute.",
        options: queueDurationOptions,
      },
      {
        key: "checkinBeforeHours",
        label: "Check-in opens before appointment",
        description:
          "How early patients can check in before their appointment time.",
        unit: "hours",
        hint: "Allowed range is 0 to 12 hours.",
        options: checkinHourOptions,
      },
    ],
  },
  {
    id: "referrals",
    title: "Referral expiration",
    description:
      "How long referral records stay usable after they are created.",
    fields: [
      {
        key: "referralFollowUpExpirationDays",
        label: "Follow-up referral expiration",
        description: "How long follow-up referrals remain valid.",
        unit: "days",
        hint: "Minimum 1 day.",
        options: expirationOptions,
      },
      {
        key: "referralExternalExpirationDays",
        label: "External referral expiration",
        description: "How long external referrals remain valid.",
        unit: "days",
        hint: "Minimum 1 day.",
        options: expirationOptions,
      },
    ],
  },
];

export function arePoliciesEqual(firstPolicies, secondPolicies) {
  return Object.keys(DEFAULT_SYSTEM_POLICIES).every(
    (key) => Number(firstPolicies[key]) === Number(secondPolicies[key]),
  );
}

export function formatPolicyTimestamp(date) {
  const timestamp = date instanceof Date ? date : new Date(date);

  if (Number.isNaN(timestamp.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(timestamp);
}
