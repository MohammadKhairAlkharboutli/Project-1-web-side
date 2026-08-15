import axiosClient from "./axiosClient";

export const userAvatarApi = {
  async upload(file) {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await axiosClient.patch("/users/me/avatar", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    return data;
  },

  async remove() {
    await axiosClient.delete("/users/me/avatar");
  },

  async getObjectUrl() {
    const { data } = await axiosClient.get("/users/me/avatar", {
      responseType: "blob",
    });

    return URL.createObjectURL(data);
  },
};
