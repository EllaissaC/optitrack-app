import sgMail from "@sendgrid/mail";

let initialized = false;

function init() {
  const apiKey = process.env.SENDGRID_API_KEY;
  if (apiKey && !initialized) {
    sgMail.setApiKey(apiKey);
    initialized = true;
  }
  return !!apiKey;
}

export async function sendLabFollowUpEmail(params: {
  to: string;
  from: string;
  brand: string;
  model: string;
  labName: string;
  visionPlan: string;
  labOrderNumber: string;
  dateSentToLab: string;
  daysAtLab: number;
}): Promise<{ sent: boolean; reason?: string }> {
  if (!init()) {
    return { sent: false, reason: "SENDGRID_API_KEY not configured" };
  }

  const msg = {
    to: params.to,
    from: params.from,
    subject: "Lab Order Follow-Up Reminder",
    text: [
      "This is an automated reminder that the following frame order has been at the lab for an extended period.",
      "",
      `Brand: ${params.brand}`,
      `Model: ${params.model}`,
      `Lab: ${params.labName}`,
      `Vision Plan: ${params.visionPlan || "N/A"}`,
      `Lab Order Number: ${params.labOrderNumber || "N/A"}`,
      `Date Sent to Lab: ${params.dateSentToLab}`,
      `Days at Lab: ${params.daysAtLab}`,
      "",
      "Please follow up with the lab regarding the status of this order.",
    ].join("\n"),
    html: `
      <p>This is an automated reminder that the following frame order has been at the lab for an extended period.</p>
      <table cellpadding="8" style="border-collapse:collapse;font-family:sans-serif;font-size:14px;">
        <tr><td style="font-weight:bold;">Brand</td><td>${params.brand}</td></tr>
        <tr><td style="font-weight:bold;">Model</td><td>${params.model}</td></tr>
        <tr><td style="font-weight:bold;">Lab</td><td>${params.labName}</td></tr>
        <tr><td style="font-weight:bold;">Vision Plan</td><td>${params.visionPlan || "N/A"}</td></tr>
        <tr><td style="font-weight:bold;">Lab Order Number</td><td>${params.labOrderNumber || "N/A"}</td></tr>
        <tr><td style="font-weight:bold;">Date Sent to Lab</td><td>${params.dateSentToLab}</td></tr>
        <tr><td style="font-weight:bold;color:#b91c1c;">Days at Lab</td><td style="color:#b91c1c;font-weight:bold;">${params.daysAtLab}</td></tr>
      </table>
      <p>Please follow up with the lab regarding the status of this order.</p>
    `,
  };

  try {
    await sgMail.send(msg);
    return { sent: true };
  } catch (err: any) {
    const detail = err?.response?.body?.errors?.[0]?.message || err?.message || "Unknown error";
    return { sent: false, reason: detail };
  }
}
