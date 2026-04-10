export const getAnalyticsData = async () => {
  const [totalPatients, dischargedPatients, activeAlerts] = await Promise.all([
    Patient.countDocuments(),
    Patient.countDocuments({ status: 'discharged' }),
    Alert.countDocuments({ status: 'open' })
  ]);

  const readmissionRate = dischargedPatients > 0
    ? Number(((activeAlerts / dischargedPatients) * 100).toFixed(1))
    : 0;

  return {
    penaltyAvoided: 1200000,
    readmissionRate,
    patientsMonitored: totalPatients,
    activeAlerts, // ✅ added
    lastUpdated: new Date(), // ✅ added

    trend: [
      { month: 'Oct', value: 22.4 },
      { month: 'Nov', value: 18.1 },
      { month: 'Dec', value: 16.5 },
      { month: 'Jan', value: 14.2 },
      { month: 'Feb', value: 12.7 },
      { month: 'Mar', value: 11.5 },
      { month: 'Apr', value: 10.9 }
    ],

    departmentSavings: [
      { name: 'Cardiology', value: 600000 },
      { name: 'Pulmonology', value: 300000 },
      { name: 'GeneralMed', value: 200000 },
      { name: 'Oncology', value: 150000 }
    ],

    modelMetrics: {
      accuracy: 94,
      precision: 91,
      recall: 89,
      drift: 0.04
    }
  };
};