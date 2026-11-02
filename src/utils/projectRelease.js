export function isProjectAvailable(project, now = new Date()) {
    return !project.data.releaseAt || now.getTime() >= Date.parse(project.data.releaseAt);
}

export function isRecognitionAvailable(item, now = new Date()) {
    return !item.releaseAt || now.getTime() >= Date.parse(item.releaseAt);
}
