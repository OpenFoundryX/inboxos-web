import type { Metadata } from "next";
import Link from "next/link";
import LegalDoc, { Section, Fill } from "@/components/marketing/LegalDoc";
import { LEGAL, SUBPROCESSORS } from "@/lib/legal";
import { RETENTION } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Privacy policy — InboxOS",
  description:
    "What data InboxOS processes from your mailbox, calendar and meetings, how long it is kept, and who else touches it.",
};

export default function PrivacyPage() {
  return (
    <LegalDoc
      title="Privacy policy"
      intro="InboxOS reads your email and sits in on your meetings, so it is fair to want the details. This page sets out exactly what we process, why, how long we keep it, and who else is involved."
    >
      <Section id="scope" heading="1. Who this covers">
        <p>
          This policy applies to {LEGAL.entity} (&ldquo;InboxOS&rdquo;,
          &ldquo;we&rdquo;), registered in <Fill value={LEGAL.registeredAddress} />
          , and to the InboxOS web app and the email, calendar and meeting
          features it provides.
        </p>
        <p>
          Where you use InboxOS through an employer, that organization is the
          data controller for the mailbox content we process on its behalf, and
          we act as its processor. For your account and billing details we are
          the controller.
        </p>
      </Section>

      <Section id="data" heading="2. What we process">
        <ul>
          <li>
            <strong>Account details.</strong> Your name, email address,
            workspace, and authentication tokens.
          </li>
          <li>
            <strong>Mailbox content.</strong> With your Google authorization, the
            messages in your connected mailbox — headers, bodies, attachments
            metadata, and labels. We read them to categorize and draft, and we
            write labels and drafts back.
          </li>
          <li>
            <strong>Calendar data.</strong> Event times, titles, attendees and
            free/busy status, used for scheduling and to decide which calls to
            join.
          </li>
          <li>
            <strong>Meeting recordings.</strong> Audio, video and transcripts of
            calls that InboxOS joins, plus the summaries and action items
            generated from them.
          </li>
          <li>
            <strong>Usage data.</strong> Feature usage, bot-hours consumed,
            scheduling threads, error logs and diagnostics.
          </li>
          <li>
            <strong>Billing data.</strong> Plan, seat count and metered usage.
            Card details go directly to our payment processor; we never store
            full card numbers.
          </li>
        </ul>
        <p>
          We do not buy personal data from third parties, and we do not build
          advertising profiles.
        </p>
      </Section>

      <Section id="use" heading="3. What we do with it">
        <ul>
          <li>Sort and label incoming mail, and hold it for batched delivery.</li>
          <li>Draft replies in your phrasing, for you to review before sending.</li>
          <li>Answer questions about your mailbox, with sources.</li>
          <li>Join calls, produce recaps, and create reminders from action items.</li>
          <li>Coordinate scheduling and place calendar invitations.</li>
          <li>Operate, secure, debug and bill for the service.</li>
        </ul>
        <p>
          InboxOS never sends an email on your behalf without you approving it,
          with the single exception of scheduling messages you have explicitly
          delegated to the scheduling agent on a given thread.
        </p>
      </Section>

      <Section id="ai" heading="4. AI processing and model training">
        <p>
          Categorization, drafting, summaries and mailbox Q&amp;A are performed
          by large language models. To do that, the relevant email or transcript
          text is sent to our model provider for the duration of the request.
        </p>
        <p>
          <strong>
            We do not use your mailbox content, transcripts or drafts to train
            models
          </strong>{" "}
          — not our own and not our providers&rsquo;. We contract for zero data
          retention with our model provider where that option exists, so prompt
          content is not persisted on their side after the response is returned.
        </p>
        <p>
          Model output can be wrong. Drafts and summaries are suggestions to
          review, not statements of fact, and you stay responsible for anything
          you send.
        </p>
      </Section>

      <Section id="google" heading="5. Google user data">
        <p>
          InboxOS&rsquo;s use of information received from Google APIs adheres to
          the{" "}
          <a
            href="https://developers.google.com/terms/api-services-user-data-policy"
            target="_blank"
            rel="noreferrer noopener"
          >
            Google API Services User Data Policy
          </a>
          , including its Limited Use requirements. Specifically, Gmail and
          Calendar data is used only to provide the features described above; it
          is not transferred to others except as needed to provide those
          features, to comply with law, or as part of a merger or acquisition; it
          is not used for advertising; and no human reads it except with your
          explicit permission, for security purposes, or where required by law.
        </p>
        <p>
          You can revoke our access at any time from your{" "}
          <a
            href="https://myaccount.google.com/permissions"
            target="_blank"
            rel="noreferrer noopener"
          >
            Google account permissions
          </a>
          , which stops all further processing.
        </p>
      </Section>

      <Section id="recording" heading="6. Meeting recording and consent">
        <p>
          Recording laws vary, and some jurisdictions require every participant
          to consent. The meeting bot appears in the participant list under a
          name you control, and you can set rules for which meetings it joins.
        </p>
        <p>
          <strong>
            You are responsible for obtaining the consent your jurisdiction
            requires
          </strong>{" "}
          before recording a call. If you are unsure, announce the recording at
          the start of the meeting.
        </p>
      </Section>

      <Section id="retention" heading="7. How long we keep it">
        <ul>
          <li>
            <strong>Meeting video:</strong> {RETENTION.starter.video} on
            Starter, {RETENTION.pro.video} on Pro, {RETENTION.team.video} on
            Team, and a negotiated window on Enterprise.
          </li>
          <li>
            <strong>Transcripts and summaries:</strong>{" "}
            {RETENTION.starter.transcript} on Starter,{" "}
            {RETENTION.pro.transcript} on Pro, {RETENTION.team.transcript} on
            Team.
          </li>
          <li>
            <strong>Mailbox content:</strong> we hold derived data (labels,
            categories, embeddings and drafts) for as long as your account is
            active. Held mail waiting on a delivery slot stays in your mailbox —
            it is not copied out to be stored by us.
          </li>
          <li>
            <strong>Logs and diagnostics:</strong> up to 90 days.
          </li>
          <li>
            <strong>Billing records:</strong> as long as tax and accounting law
            requires.
          </li>
        </ul>
        <p>
          Close your account and we delete or irreversibly anonymize the rest
          within 30 days, other than backups which age out within a further 90
          days.
        </p>
      </Section>

      <Section id="sharing" heading="8. Who else touches your data">
        <p>
          We use the following subprocessors. We do not sell personal data, and
          we do not share it for anyone else&rsquo;s marketing.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[34rem] border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-black/10">
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Provider
                </th>
                <th scope="col" className="py-2 pr-4 font-semibold">
                  Purpose
                </th>
                <th scope="col" className="py-2 font-semibold">
                  Data involved
                </th>
              </tr>
            </thead>
            <tbody>
              {SUBPROCESSORS.map((s) => (
                <tr key={s.purpose} className="border-b border-black/5">
                  <td className="py-3 pr-4 align-top">
                    <Fill value={s.name} />
                  </td>
                  <td className="py-3 pr-4 align-top text-ink/70">
                    {s.purpose}
                  </td>
                  <td className="py-3 align-top text-ink/70">{s.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          We may also disclose data where legally compelled, and will tell you
          unless we are prohibited from doing so.
        </p>
      </Section>

      <Section id="rights" heading="9. Your rights">
        <p>
          Depending on where you live, you can ask us to give you a copy of your
          data, correct it, delete it, restrict or object to processing, or port
          it elsewhere. You can also withdraw consent by disconnecting your
          Google account.
        </p>
        <p>
          Email <Fill value={LEGAL.privacyEmail} /> and we will respond within
          30 days. If you are in the EU or UK you can complain to your local
          supervisory authority.
        </p>
      </Section>

      <Section id="legal-bases" heading="10. Legal bases (EU and UK)">
        <ul>
          <li>
            <strong>Contract:</strong> processing your mail, calendar and
            meetings to deliver the service you signed up for.
          </li>
          <li>
            <strong>Legitimate interests:</strong> security, abuse prevention,
            debugging and service improvement.
          </li>
          <li>
            <strong>Consent:</strong> optional integrations, and meeting
            recording where consent is the applicable basis.
          </li>
          <li>
            <strong>Legal obligation:</strong> tax, accounting and lawful
            requests.
          </li>
        </ul>
      </Section>

      <Section id="security" heading="11. Security">
        <p>
          Data is encrypted in transit and at rest. Access to production systems
          is restricted, logged, and requires multi-factor authentication.
          OAuth tokens are stored encrypted and are never exposed to the browser.
        </p>
        <p>
          No system is perfect. If we suffer a breach affecting your data we will
          notify you and any required regulator without undue delay.
        </p>
      </Section>

      <Section id="transfers" heading="12. International transfers">
        <p>
          Your data is processed in more than one country. Application hosting,
          the database and the job queue run in Singapore. Meeting recording and
          transcription run in the United States, as does the AI processing
          described in section 4. Billing is processed in India. The
          subprocessor table in section 8 names who operates each.
        </p>
        <p>
          By using InboxOS you accept that your data is processed in these
          locations.
        </p>
      </Section>

      <Section id="cookies" heading="13. Cookies">
        <p>
          We use a small number of cookies and equivalent local storage, and we
          do not use advertising or cross-site tracking cookies.
        </p>
        <ul>
          <li>
            <strong>Strictly necessary:</strong> session and authentication, so
            you stay signed in. These cannot be turned off.
          </li>
          <li>
            <strong>Preferences:</strong> remembering choices such as your
            onboarding progress and delivery settings.
          </li>
          <li>
            <strong>Analytics:</strong> aggregate product usage, so we can see
            which features are actually used. Set only with your consent where
            consent is required.
          </li>
        </ul>
        <p>
          Your browser can block or delete cookies, though blocking the strictly
          necessary ones will stop sign-in from working.
        </p>
      </Section>

      <Section id="children" heading="14. Children">
        <p>
          InboxOS is a workplace tool and is not intended for anyone under 16. We
          do not knowingly collect their data, and will delete it if we learn we
          have.
        </p>
      </Section>

      <Section id="changes" heading="15. Changes">
        <p>
          We will update this page when our practices change and move the
          &ldquo;last updated&rdquo; date. For changes that materially affect
          your rights we will email you at least 30 days beforehand.
        </p>
      </Section>

      <Section id="contact" heading="16. Contact">
        <p>
          Privacy questions: <Fill value={LEGAL.privacyEmail} />. Anything else:{" "}
          <Fill value={LEGAL.supportEmail} />. We are registered in{" "}
          <Fill value={LEGAL.registeredAddress} />.
        </p>
        <p>
          See also our <Link href="/terms">terms of service</Link>.
        </p>
      </Section>
    </LegalDoc>
  );
}
