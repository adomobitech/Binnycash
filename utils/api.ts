const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface PlatformStats {
  totalUsers: number;
  totalRewardsPaid: number;
  instantCashouts: number;
  tasksCompleted: number;
}

export async function fetchPlatformStats(): Promise<PlatformStats> {
  try {
    // Note: Jab tumhara real backend ready ho, yahan uska endpoint lagana
    // Abhi ke liye hum dummy data return kar rahe hain UI build karne ke liye
    return {
      totalUsers: 145000,
      totalRewardsPaid: 165423,
      instantCashouts: 94,
      tasksCompleted: 12000
    };
  } catch (error) {
    console.error("API Error: ", error);
    throw error;
  }
}