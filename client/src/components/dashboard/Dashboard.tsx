import React from "react";
import { Stack, Typography } from "@mui/material";
import ReadinessTile from "./ReadinessTile";
import Grid from "@mui/material/Unstable_Grid2"; // Grid version 2
import DashSessionSummaryCard from "./DashSessionSummaryCard";
import NewSessionButton from "./NewSessionButton";
import { RootState } from "../../store/store";
import { useSelector } from "react-redux";
import BalanceLineChart from "../charts/BalanceLineChart";
import SteppedAreaChart from "../charts/SteppedAreaChart";
import { bodyPartLabels } from "../../styles/bodyPartLabels";
import { bodyPartColors } from "../../styles/bodyPartColors";
import { DateTime, Interval } from "luxon";
import BodyPartMetrics from "@shared/types/bodyPartMetrics";
import { MetricsTable } from "@shared/types";
import BodyPart from "@shared/types/bodyPart";

const Dashboard: React.FC = () => {
  const sessions = useSelector(
    (state: RootState) => state.sessions.sessions || {}
  );
  const sessionIds = useSelector(
    (state: RootState) => state.sessions.sessionIds || []
  );

  const metricsTable: MetricsTable = useSelector(
    (state: RootState) => state.metrics.metricsTable || {}
  );

  const start = DateTime.now().minus({ days: 30 });
  const end = DateTime.now();
  const range = Interval.fromDateTimes(start, end.plus({ day: 1 }));
  const metricsData = range
    .splitBy({ days: 1 })
    .reduce<MetricsTable>((acc, dt) => {
      const dateKey = dt.start?.toISODate();
      if (dateKey) {
        acc[dateKey] = metricsTable[dateKey] || null;
      }
      return acc;
    }, {} as MetricsTable);

  const readinessValues: BodyPartMetrics = metricsData[
    DateTime.now().toISODate()
  ]
    ? metricsData[DateTime.now().toISODate()].readiness
    : {
        fingers: 0,
        upperBody: 0,
        lowerBody: 0,
      };

  const readinessData = Object.values(BodyPart).map((bodyPart) => ({
    title: bodyPartLabels[bodyPart],
    value: Math.round(readinessValues[bodyPart] * 100),
    feedback: "Textual feedback on training patterns coming soon!",
    color: bodyPartColors[bodyPart],
  }));

  return (
    <div>
      <Grid container spacing={2} sx={{ minHeight: "90vh" }}>
        <Grid xs={12} md={4}>
          <Typography variant="h5">Readiness</Typography>
          <Stack direction="column" width={"100%"}>
            {readinessData.map((data, index) => (
              <ReadinessTile key={index} data={data} />
            ))}
          </Stack>
        </Grid>
        <Grid xs={12} md={4}>
          <Typography variant="h5">Past Sessions</Typography>
          <Stack width={"100%"}>
            <NewSessionButton />
            {sessionIds.length > 0 ? (
              sessionIds.slice(0, 3).map((id: number) => {
                const session = sessions[id];
                return session ? (
                  <DashSessionSummaryCard key={id} session={session} />
                ) : (
                  <Typography key={id} color="textSecondary">
                    Session data not available
                  </Typography>
                );
              })
            ) : (
              <Typography color="textSecondary">
                No sessions available
              </Typography>
            )}
          </Stack>
        </Grid>
        <Grid xs={12} md={4}>
          <Typography variant="h5">Visualizations</Typography>
          <Stack>
            <SteppedAreaChart metricsData={metricsData} />
            <BalanceLineChart metricsData={metricsData} />
          </Stack>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
