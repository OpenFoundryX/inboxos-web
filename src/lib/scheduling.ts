/**
 * The user's public booking link.
 *
 * The API doesn't issue these yet, so it's a placeholder — kept here rather
 * than written out at each call site so the dashboard and the scheduling page
 * can't drift apart, and so there's one line to change when it becomes real.
 */
export const SCHEDULING_LINK = "inboxos.app/e/your-scheduling-link";

export const schedulingLinkUrl = `https://${SCHEDULING_LINK}`;
