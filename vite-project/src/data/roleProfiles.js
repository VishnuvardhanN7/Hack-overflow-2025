export const roleProfiles = {
  "Frontend Developer": {
    required: [
      { name: "JavaScript", target: 80, weight: 1.2 },
      { name: "React", target: 80, weight: 1.3 },
      { name: "Git", target: 65, weight: 0.7 },
      { name: "REST APIs", target: 65, weight: 0.8 },
    ],
  },
  "Backend Developer": {
    required: [
      { name: "Python", target: 80, weight: 1.1 },
      { name: "Data Structures", target: 75, weight: 1.2 },
      { name: "Algorithms", target: 70, weight: 1.0 },
      { name: "SQL", target: 75, weight: 1.1 },
      { name: "REST APIs", target: 70, weight: 1.0 },
      { name: "Git", target: 65, weight: 0.7 },
      { name: "Docker", target: 60, weight: 0.7 },
    ],
  },
  "Data Analyst": {
    required: [
      { name: "SQL", target: 85, weight: 1.4 },
      { name: "Python", target: 70, weight: 1.0 },
      { name: "Statistics", target: 65, weight: 0.9 },
      { name: "Data Visualization", target: 70, weight: 1.0 },
      { name: "Communication", target: 65, weight: 0.7 },
    ],
  },
};

export const roleNames = Object.keys(roleProfiles);
