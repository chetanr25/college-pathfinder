export const validateRank = (rank: number): boolean => {
    return rank > 0;
};

export const validatePreferredBranch = (branch: string): boolean => {
    const validBranches = ['Engineering', 'Science', 'Arts', 'Commerce'];
    return validBranches.includes(branch);
};

export const validateLocation = (location: string): boolean => {
    return location.trim().length > 0;
};

export const validateHostelReadiness = (isReady: boolean): boolean => {
    return typeof isReady === 'boolean';
};

export const validateInputs = (rank: number, branch: string, location: string, isReady: boolean): boolean => {
    return validateRank(rank) && validatePreferredBranch(branch) && validateLocation(location) && validateHostelReadiness(isReady);
};