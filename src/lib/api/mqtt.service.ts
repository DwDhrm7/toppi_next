/* eslint-disable @typescript-eslint/no-unused-vars */
export const MqttService = {
  republish: async (deviceId: string): Promise<{ success: boolean; message: string }> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, message: `Berhasil re-publish MQTT untuk perangkat ${deviceId}` });
      }, 800);
    });
  },
  exportCsv: async (_dateFrom: string, _dateTo: string): Promise<Blob> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const csvContent = "device_id,status,date\nTOPPI-001,SUCCESS,2026-05-19\nTOPPI-002,FAILED,2026-05-19\n";
        resolve(new Blob([csvContent], { type: 'text/csv' }));
      }, 1500);
    });
  }
};
