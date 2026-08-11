import type { Metadata } from "next";
import Link from "next/link";
import LegalDoc, { Section, Fill } from "@/components/marketing/LegalDoc";
import { LEGAL } from "@/lib/legal";
import { PLANS } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Terms of service — InboxOS",
  description:
    "The agreement covering your use of InboxOS: plans and metered billing, meeting recording responsibilities, acceptable use, and liability.",
};

const pro = PLANS.find((p) => p.id === "pro")!;

export default function TermsPage() {
  return (
    <LegalDoc
      title="Terms of service"
      intro="These terms govern your use of InboxOS. They are written to be readable rather than impressive, but they are still a contract — please read them."
    >
      <Section id="agreement" heading="1. The agreement">
        <p>
          This is an agreement between you and {LEGAL.entity} (&ldquo;InboxOS&rdquo;,
          &ldquo;we&rdquo;, &ldquo;us&rdquo;). By creating an account, connecting
          a mailbox, or using InboxOS, you accept these terms. If you are agreeing on behalf of an organization, you confirm
          you have authority to bind it, and &ldquo;you&rdquo; means that
          organization.
        </p>
        <p>
          Our <Link href="/privacy">privacy policy</Link> forms part of this
          agreement.
        </p>
      </Section>

      <Section id="service" heading="2. What InboxOS does">
        <p>
          InboxOS connects to your mailbox and calendar in order to categorize
          and batch your incoming mail, prepare draft replies, join and write up
          meetings, and coordinate scheduling. Exactly which features you get
          depends on your plan.
        </p>
        <p>
          Features described as forthcoming — including Outlook support and parts
          of agent scheduling — are not part of what you are buying today, and we
          make no commitment about when they ship.
        </p>
      </Section>

      <Section id="accounts" heading="3. Your account">
        <p>
          You need to be at least 16 and legally able to enter a contract. Keep
          your credentials secure, do not share seats between people, and tell us
          promptly if you think an account has been compromised. You are
          responsible for everything done under your account.
        </p>
      </Section>

      <Section id="billing" heading="4. Plans, billing and metered usage">
        <ul>
          <li>
            <strong>Seats.</strong> Paid plans are charged per seat, monthly or
            annually in advance. Annual plans are billed for the full term up
            front at the discounted rate.
          </li>
          <li>
            <strong>Trial.</strong> The Pro trial runs 7 days and includes
            Pro&rsquo;s full monthly bot-hour and AI draft allowance. The
            trial ends when the 7 days are up, not before, and card
            authorisation is required up front. Trials are once per customer.
          </li>
          <li>
            <strong>Metered usage.</strong> Meeting bot-hours and scheduling
            threads are metered. Bot-hours are measured as recorded bot time,
            prorated to the second. Included allowances reset each billing month
            and <strong>do not roll over</strong>.
          </li>
          <li>
            <strong>Changes.</strong> Upgrades take effect immediately and are
            prorated. Downgrades take effect at the end of your current term.
          </li>
          <li>
            <strong>Taxes.</strong> Prices exclude VAT, GST and sales tax, which
            we add where applicable.
          </li>
          <li>
            <strong>Non-payment.</strong> If an invoice goes unpaid we may
            suspend the account after written notice.
          </li>
        </ul>
        <p>
          Current published pricing — including the ${pro.monthly} monthly and $
          {pro.annual} annual Pro rate — is on the{" "}
          <Link href="/#pricing">pricing page</Link>. We may change prices with
          at least 30 days&rsquo; notice, effective at your next renewal; your
          current term is never repriced mid-flight.
        </p>
        <p>
          Fees are non-refundable except where the law requires otherwise, or
          where we terminate your account without cause, in which case we refund
          the unused portion of any prepaid term.
        </p>
      </Section>

      <Section id="recording" heading="5. Meeting recording is your responsibility">
        <p>
          Many jurisdictions require the consent of some or all participants
          before a call is recorded. InboxOS gives you the controls — a visible
          bot in the participant list, a name you choose, and rules for which
          meetings it joins — but it cannot know what your local law requires.
        </p>
        <p>
          <strong>
            You are solely responsible for obtaining any consent or giving any
            notice required before recording, and for the lawfulness of
            recording each meeting.
          </strong>{" "}
          You agree to indemnify us against claims arising from a recording you
          caused InboxOS to make.
        </p>
      </Section>

      <Section id="acceptable-use" heading="6. Acceptable use">
        <p>You agree not to:</p>
        <ul>
          <li>
            Connect a mailbox you are not authorized to access, or record
            meetings you are not entitled to record.
          </li>
          <li>Send spam, phishing, or bulk unsolicited mail through InboxOS.</li>
          <li>
            Use the service to build a competing product, or to train a machine
            learning model on its output.
          </li>
          <li>
            Probe, scrape, reverse engineer, or circumvent rate limits and usage
            metering.
          </li>
          <li>Resell or sublicense access without our written agreement.</li>
          <li>Break the law, or infringe anyone&rsquo;s rights.</li>
        </ul>
        <p>
          We may suspend access immediately where we reasonably believe there is
          a security risk, unlawful use, or harm to other customers.
        </p>
      </Section>

      <Section id="content" heading="7. Your content">
        <p>
          Your email, calendar entries, recordings and documents remain yours. You
          grant us a limited, non-exclusive licence to host, process and transmit
          them strictly to operate the service for you, and to our subprocessors
          for the same purpose. That licence ends when you delete the content or
          close your account.
        </p>
        <p>
          We do not use your content to train models. See the{" "}
          <Link href="/privacy#ai">privacy policy</Link> for detail.
        </p>
      </Section>

      <Section id="ai-output" heading="8. AI output">
        <p>
          Categorization, drafts, summaries and scheduling suggestions are
          generated automatically and{" "}
          <strong>will sometimes be wrong</strong> — a message can be mislabelled,
          a summary can miss something, a draft can misstate a fact.
        </p>
        <p>
          Review anything before you rely on it or send it. InboxOS is not a
          substitute for professional advice, and we are not liable for the
          consequences of unreviewed output. Where you delegate scheduling to
          the agent, you accept that it will send scheduling messages on your
          behalf within the limits you set.
        </p>
      </Section>

      <Section id="third-parties" heading="9. Third-party services">
        <p>
          InboxOS depends on services we do not control, including Google
          Workspace, Zoom, Google Meet and Microsoft Teams. Your use of those
          services is governed by their own terms, and we are not responsible if
          they change, break, or withdraw an interface we rely on.
        </p>
      </Section>

      <Section id="availability" heading="10. Availability">
        <p>
          We aim to keep InboxOS available and will give notice of planned
          maintenance where practical, but the service is provided without an
          uptime commitment unless your order form says otherwise. Enterprise
          agreements can include a service level commitment.
        </p>
      </Section>

      <Section id="termination" heading="11. Termination">
        <p>
          You can cancel at any time from your account settings; cancellation
          takes effect at the end of your current term. Either of us may
          terminate for material breach that goes unremedied for 30 days after
          written notice.
        </p>
        <p>
          On termination your access ends and we delete your data on the schedule
          in the <Link href="/privacy#retention">privacy policy</Link>. Export
          anything you want to keep first.
        </p>
      </Section>

      <Section id="warranties" heading="12. Disclaimers">
        <p>
          Except as expressly stated, InboxOS is provided &ldquo;as is&rdquo;
          without warranties of any kind, whether express or implied, including
          fitness for a particular purpose, merchantability, or non-infringement.
          We do not warrant that the service will be uninterrupted, error-free,
          or that its output will be accurate.
        </p>
      </Section>

      <Section id="liability" heading="13. Limitation of liability">
        <p>
          To the fullest extent the law allows, neither party is liable for
          indirect, incidental, special, consequential or punitive damages, or
          for lost profits, revenue, data or goodwill.
        </p>
        <p>
          Our total aggregate liability arising out of this agreement is limited
          to the fees you paid us in the 12 months before the claim arose.
        </p>
        <p>
          Nothing here excludes liability that cannot lawfully be excluded,
          including for death or personal injury caused by negligence, or for
          fraud.
        </p>
      </Section>

      <Section id="indemnity" heading="14. Indemnity">
        <p>
          You will defend and indemnify us against third-party claims arising
          from your use of InboxOS in breach of these terms, your content, or
          recordings you caused to be made.
        </p>
      </Section>

      <Section id="changes" heading="15. Changes to these terms">
        <p>
          We may update these terms. For material changes we will give at least
          30 days&rsquo; notice by email or in the app. Continuing to use InboxOS
          after that means you accept the new terms; if you do not, you may
          cancel and we will refund any unused prepaid fees.
        </p>
      </Section>

      <Section id="law" heading="16. Governing law and disputes">
        <p>
          This agreement is governed by the laws of{" "}
          <Fill value={LEGAL.governingLaw} />, excluding its conflict of laws
          rules, and the courts of <Fill value={LEGAL.courts} /> have exclusive
          jurisdiction. Nothing stops either party seeking injunctive relief
          where needed.
        </p>
      </Section>

      <Section id="general" heading="17. General">
        <p>
          These terms, together with the privacy policy and any order form, are
          the entire agreement between us. If a provision is unenforceable the
          rest stands. Failing to enforce a right is not a waiver of it. You may
          not assign this agreement without our consent; we may assign it in
          connection with a merger, acquisition or sale of assets.
        </p>
        <p>
          Legal notices go to <Fill value={LEGAL.legalEmail} />. We are
          registered in <Fill value={LEGAL.registeredAddress} />.
        </p>
      </Section>
    </LegalDoc>
  );
}
