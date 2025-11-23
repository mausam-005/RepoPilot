"use client";

import api from "@/lib/axios";
import { useEffect } from "react";

export default function Page() {
  const getHealth = async () => {
    try {
      const response = await api.get("/health", {
        headers: {
          Authorization: localStorage.getItem("token"),
          refreshToken: localStorage.getItem("refreshToken"),
        },
        withCredentials: true,
        method: "GET",
      });

      const accessToken = response.headers["x-access-token"];
      const refreshToken = response.headers["x-refresh-token"];
      if (accessToken && refreshToken) {
        localStorage.setItem("token", accessToken);
        localStorage.setItem("refreshToken", refreshToken);
      }

    } catch (err) {
      // console.log(err);
    } finally {
    }
  };

  useEffect(() => {
    getHealth();
  }, []);

  return <div>page</div>;
}
