import { DateTime } from "luxon";
import { fetchMetricsWithSessionsForDateRange } from "../store/metricsSlice";
import store from "../store/store";
import { isRangeLoaded } from "../utils/metricUtils";

export const dashboardLoader = async () => {
  const endDate = DateTime.now().toISODate();
  const startDate = DateTime.now().minus({ months: 1 }).toISODate();

  const state = store.getState();

  if (!isRangeLoaded(state, startDate, endDate)) {
    await store.dispatch(
      fetchMetricsWithSessionsForDateRange({
        startDate,
        endDate,
      })
    );
  }

  return null;
};

export default dashboardLoader;
