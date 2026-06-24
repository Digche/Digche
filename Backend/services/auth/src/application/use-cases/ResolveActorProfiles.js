import { AppError } from "../errors/AppError.js";

const PARTICIPANT_TYPES = {
  USER: "user",
  ADMIN: "admin"
};

export class ResolveActorProfiles {
  constructor({
    userRepository,
    adminUserRepository
  }) {
    this.userRepository = userRepository;
    this.adminUserRepository = adminUserRepository;
  }

  async execute({ participants }) {
    if (!Array.isArray(participants)) {
      throw new AppError("Participants must be an array", 400, "INVALID_PARTICIPANTS");
    }

    const uniqueParticipants = this.uniqueParticipants(participants);
    const profiles = [];

    for (const participant of uniqueParticipants) {
      if (participant.type === PARTICIPANT_TYPES.USER) {
        const user = await this.userRepository.findById(participant.id);

        if (user) {
          profiles.push({
            id: user.id,
            type: PARTICIPANT_TYPES.USER,
            displayName: this.displayNameFor(user),
            photoUrl: user.photoUrl,
            phone: user.phone,
            roles: user.roles
          });
        }
      }

      if (participant.type === PARTICIPANT_TYPES.ADMIN) {
        const admin = await this.adminUserRepository.findById(participant.id);

        if (admin) {
          profiles.push({
            id: admin.id,
            type: PARTICIPANT_TYPES.ADMIN,
            displayName: this.displayNameFor(admin),
            photoUrl: admin.photoUrl,
            phone: admin.phone,
            role: admin.role
          });
        }
      }
    }

    return {
      profiles
    };
  }

  uniqueParticipants(participants) {
    const seen = new Set();
    const uniqueParticipants = [];

    for (const participant of participants) {
      const id = String(participant?.id || "").trim();
      const type = String(participant?.type || "").trim();

      if (!id) {
        throw new AppError("Participant id is required", 400, "PARTICIPANT_ID_REQUIRED");
      }

      if (![PARTICIPANT_TYPES.USER, PARTICIPANT_TYPES.ADMIN].includes(type)) {
        throw new AppError("Invalid participant type", 400, "INVALID_PARTICIPANT_TYPE");
      }

      const key = `${type}:${id}`;

      if (seen.has(key)) {
        continue;
      }

      seen.add(key);
      uniqueParticipants.push({ id, type });
    }

    return uniqueParticipants;
  }

  displayNameFor(actor) {
    const fullName = [actor.firstName, actor.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    return fullName || actor.username || actor.phone || null;
  }
}
