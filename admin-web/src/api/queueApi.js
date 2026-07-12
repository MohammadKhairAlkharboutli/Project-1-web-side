import { mockQueueItems } from "@/pages/Admin/Queue/mockQueueData";

let queueItems = [...mockQueueItems];

export const queueApi = {
  async getAdminLiveQueue(filters = {}) {
    return queueItems.filter((queueItem) => {
      const matchesClinic =
        !filters.clinicId || Number(queueItem.clinicId) === Number(filters.clinicId);
      const matchesDoctor =
        !filters.doctorId || Number(queueItem.doctorId) === Number(filters.doctorId);

      return matchesClinic && matchesDoctor;
    });
  },

  async skipQueue(queueId) {
    const now = new Date().toISOString();
    let updatedQueueItem = null;

    queueItems = queueItems.map((queueItem) => {
      if (Number(queueItem.id) !== Number(queueId)) {
        return queueItem;
      }

      updatedQueueItem = {
        ...queueItem,
        status: "skipped",
        updated_at: now,
      };

      return updatedQueueItem;
    });

    return updatedQueueItem;
  },

  async reorderQueue(queueId, newPosition) {
    let updatedQueueItem = null;

    queueItems = queueItems.map((queueItem) => {
      if (Number(queueItem.id) !== Number(queueId)) {
        return queueItem;
      }

      updatedQueueItem = {
        ...queueItem,
        position: newPosition,
        updated_at: new Date().toISOString(),
      };

      return updatedQueueItem;
    });

    return updatedQueueItem;
  },
};
