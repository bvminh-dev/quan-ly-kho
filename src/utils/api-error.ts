import axios from "axios";

export function getApiErrorMessage(error: unknown, fallback = "Có lỗi xảy ra, vui lòng thử lại sau") {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;

    if (data) {
      if (typeof data.message === "string" && data.message.trim()) {
        return data.message;
      }

      if (Array.isArray(data.message) && data.message.length > 0) {
        const first = data.message[0];
        if (typeof first === "string" && first.trim()) {
          return first;
        }
      }

      if (typeof data.error === "string" && data.error.trim()) {
        return data.error;
      }
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

