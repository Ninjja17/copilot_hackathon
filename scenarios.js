// Preloaded enterprise scenarios for SyncUp problem intake demonstration
export const SCENARIOS = [
  {
    id: "logistics_scanners",
    title: "Warehouse Logistics - Scanner Freeze",
    subtitle: "Zone B Handheld Terminals Failing on Batch QR Ingestion",
    department: "Supply Chain & Fulfillment",
    reporter: {
      name: "Marcus Vance",
      role: "Floor Operations Supervisor",
      location: "Dallas Distribution Center #4",
      shift: "Night Shift (19:00 - 04:00)"
    },
    initialReport: "Hey SyncUp, our pickers in Zone B are at a total standstill. All 24 handheld barcode scanners started freezing up at 23:45 whenever they scan batches with QR prefix 'PR-'. Power cycling only works for one scan before it locks up with a MEM_ALLOC_FAIL error. We have trucks leaving in 2 hours and 400 orders in the backlog.",
    socraticTurns: [
      {
        agentQuestion: "I hear the urgency, Marcus—halting 24 pickers before truck departure is high stakes. Can you tell me: did this start immediately after the 22:00 WMS maintenance window, and are any units in Zone A or C having this same issue?",
        userAnswer: "Zone A pickers on standard 1D barcodes are fine. It's specifically the new QR pallets on Zone B. I suspect the 22:00 firmware update changed the buffer size. I haven't checked Zone C yet though.",
        decisions: {
          claims: [
            { text: "Zone A scanners on 1D barcodes are functioning normally", type: "observed_fact", confidence: 0.98 },
            { text: "Issue started at 23:45 following the 22:00 WMS maintenance", type: "observed_fact", confidence: 0.95 },
            { text: "The firmware update changed the buffer size causing the crash", type: "user_hypothesis", confidence: 0.91 },
            { text: "Whether Zone C is experiencing the same QR scan crash", type: "critical_unknown", confidence: 0.94 }
          ],
          sufficient_detail: 0.65,
          urgency_score: 5,
          target_department: "IT_Hardware_Infrastructure"
        }
      },
      {
        agentQuestion: "Understood. One last critical piece: what is the temporary workaround your team has attempted, and do you have a way to roll back the scanner firmware over the air without docking all 24 units?",
        userAnswer: "Right now we're manually entering 12-digit SKU numbers on clipboards, which takes 4x longer. We don't know if we can roll back firmware over Wi-Fi, or if we have to plug each device into the charging dock rack in the admin office.",
        decisions: {
          claims: [
            { text: "Current manual entry takes 4x longer than barcode scanning", type: "observed_fact", confidence: 0.96 },
            { text: "Manual entry risks missing the 02:00 AM freight dispatch window", type: "observed_fact", confidence: 0.94 },
            { text: "Whether OTA Wi-Fi firmware rollback is supported without physical docking", type: "critical_unknown", confidence: 0.97 }
          ],
          sufficient_detail: 0.96,
          urgency_score: 5,
          target_department: "IT_Hardware_Infrastructure"
        }
      }
    ],
    companyContext: {
      matchedSop: "SOP-WMS-402: Emergency Rollback Procedure for Zebra TC57 Terminals",
      recentIncidents: [
        { id: "INC-9912", title: "Dallas Hub Zone B switch port saturation", status: "Resolved (3 days ago)" },
        { id: "INC-10041", title: "WMS 2026.10.27 Release Notes: Added expanded QR metadata payload", status: "Investigating" }
      ],
      impactAssessment: {
        slaRisk: "Critical ($18,500 freight delay penalty per hour past 02:00)",
        workersAffected: 24,
        ordersAtRisk: "420 expedited freight shipments"
      }
    }
  },
  {
    id: "fintech_checkout",
    title: "FinTech Platform - Checkout 504 Spikes",
    subtitle: "Tier-1 Merchant Gateway Timeouts on Apple Pay Ingestion",
    department: "Payments & Engineering",
    reporter: {
      name: "Siddharth Rao",
      role: "Lead Merchant Support Engineer",
      location: "San Francisco HQ",
      shift: "Peak European Trading Window"
    },
    initialReport: "SyncUp, our enterprise client Lumina Retail is reporting that 30% of their checkout requests are failing with HTTP 504 Gateway Timeouts. Their customer support queue has spiked by 200 tickets in the last 20 minutes.",
    socraticTurns: [
      {
        agentQuestion: "Understood Siddharth. Are the 504 timeouts isolated to a specific payment method or geography, and what latency are you observing on the upstream acquiring bank connector?",
        userAnswer: "It looks isolated to Apple Pay tokens routed through our European gateway in Frankfurt. Credit card direct entries are passing smoothly. I'm guessing the token decryption microservice is throttling after the morning deploy.",
        decisions: {
          claims: [
            { text: "30% of Lumina Retail checkout attempts failing with 504 Timeouts", type: "observed_fact", confidence: 0.97 },
            { text: "Failures are isolated to Apple Pay tokens via Frankfurt gateway", type: "observed_fact", confidence: 0.93 },
            { text: "Direct credit card entries are unaffected", type: "observed_fact", confidence: 0.99 },
            { text: "Token decryption microservice is throttling due to morning deploy", type: "user_hypothesis", confidence: 0.88 }
          ],
          sufficient_detail: 0.72,
          urgency_score: 4,
          target_department: "Payments_Core_Engineering"
        }
      },
      {
        agentQuestion: "Got it. Has any traffic rerouting or fallback to our London secondary gateway been initiated yet, and do we know if other merchants using Frankfurt Apple Pay are seeing degradation?",
        userAnswer: "We haven't flipped the DNS traffic switch yet because we need Ops approval. We don't know yet if other merchants are hit because Lumina accounts for 80% of our Frankfurt volume.",
        decisions: {
          claims: [
            { text: "Traffic reroute to London secondary gateway has not yet been executed", type: "observed_fact", confidence: 0.95 },
            { text: "Whether other European merchants are experiencing identical degradation", type: "critical_unknown", confidence: 0.96 }
          ],
          sufficient_detail: 0.94,
          urgency_score: 5,
          target_department: "Payments_Core_Engineering"
        }
      }
    ],
    companyContext: {
      matchedSop: "SOP-PAY-118: Cross-Region Gateway Failover for EU-Central-1",
      recentIncidents: [
        { id: "INC-8812", title: "Apple Pay Certificate Expiry Check", status: "Verified Valid" },
        { id: "INC-8820", title: "Frankfurt v2.14 Tokenizer Canary rollout", status: "Deployed 45m ago" }
      ],
      impactAssessment: {
        slaRisk: "Tier-1 SLA Penalty Trigger ($45,000 / hr)",
        workersAffected: 15,
        ordersAtRisk: "Estimated €230,000 in abandoned checkout carts"
      }
    }
  },
  {
    id: "healthcare_emr",
    title: "Healthcare / Hospital - EMR Sync Lag",
    subtitle: "Nurse Tablet Vital Signs Failing to Replicate to Central Station",
    department: "Clinical Informatics & Health Tech",
    reporter: {
      name: "Nurse Elena Rostova",
      role: "Charge Nurse, ICU Ward 4",
      location: "St. Jude Metro Medical Center",
      shift: "Night Shift"
    },
    initialReport: "SyncUp, our bedside tablets in ICU Ward 4 aren't pushing patient vitals to the telemetry central nurses' station. We entered telemetry stats 15 minutes ago and the central screens are still showing 'Awaiting Data'.",
    socraticTurns: [
      {
        agentQuestion: "Nurse Elena, this is vital for patient safety. Are the local bedside monitors sounding their own physical alarms if vitals cross critical thresholds, and is this affecting all 12 beds in ICU-4?",
        userAnswer: "Yes, thank goodness the bedside Philips monitors still alarm locally. But the central board is blank for beds 401 through 408. Beds 409-412 in the south wing seem to be updating fine. I think the Wi-Fi access point in corridor 4A dropped.",
        decisions: {
          claims: [
            { text: "Local bedside Philips monitors alarm properly and independently", type: "observed_fact", confidence: 0.99 },
            { text: "Central telemetry station blank specifically for beds 401-408", type: "observed_fact", confidence: 0.98 },
            { text: "South wing beds 409-412 are replicating normally", type: "observed_fact", confidence: 0.94 },
            { text: "Corridor 4A Wi-Fi access point dropped offline", type: "user_hypothesis", confidence: 0.85 }
          ],
          sufficient_detail: 0.75,
          urgency_score: 5,
          target_department: "Clinical_Engineering_Urgent"
        }
      },
      {
        agentQuestion: "Understood. Has the on-duty biomedical engineering technician been paged yet, and are paper telemetry logs currently being maintained at bedside?",
        userAnswer: "We assigned two dedicated float nurses to stand at bedside 401-408 with manual paper charts. We haven't paged BioMed yet because we couldn't get through their night line.",
        decisions: {
          claims: [
            { text: "Manual bedside logging initiated with 2 float nurses as safeguard", type: "observed_fact", confidence: 0.97 },
            { text: "On-duty BioMed technician not yet reached due to unanswered night phone line", type: "observed_fact", confidence: 0.96 },
            { text: "Whether VLAN 40 medical Wi-Fi controller is reporting AP reboot loops", type: "critical_unknown", confidence: 0.95 }
          ],
          sufficient_detail: 0.98,
          urgency_score: 5,
          target_department: "Clinical_Engineering_Urgent"
        }
      }
    ],
    companyContext: {
      matchedSop: "SOP-CLIN-009: ICU Telemetry Network Redundancy & Manual Vital Protocol",
      recentIncidents: [
        { id: "INC-3021", title: "Cisco Catalyst AP switch firmware update Ward 4", status: "Scheduled for tomorrow" }
      ],
      impactAssessment: {
        slaRisk: "Patient Safety High Priority (Level 1 Clinical Alert)",
        workersAffected: 8,
        ordersAtRisk: "8 Intensive Care Unit Patients under continuous monitoring"
      }
    }
  }
];
