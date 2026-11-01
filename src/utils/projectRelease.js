// November 7, 2026, 00:00 in America/New_York (EST).
export const KNOT_HAT_RELEASE_AT = '2026-11-07T05:00:00Z';

export function isProjectAvailable(project, now = new Date()) {
    return !project.data.releaseAt || now.getTime() >= Date.parse(project.data.releaseAt);
}

export function isKnotHatReleased(now = new Date()) {
    return now.getTime() >= Date.parse(KNOT_HAT_RELEASE_AT);
}
