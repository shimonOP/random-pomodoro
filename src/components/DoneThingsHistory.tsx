import { Table, TableHead, TableRow, TableCell, TableBody } from "@mui/material";
import Stack from "@mui/material/Stack";
import { TodoRecord, getRecordsToday } from "../datas/TodoRecord";

type RecordsSummaryProps = {
    records:TodoRecord[]
}
type Row = {
    id: string
    title: string
    runTime: string
}
export const RecordsSummary = (props: RecordsSummaryProps) => {
    const {records } = props;
    const recordsToday = getRecordsToday(records);
    const rows = recordsToday.map(d => {
        const row: Row = {
            id: d.id,
            title: d.titles.join("/"),
            runTime: (d.runTime / 60).toFixed(1).toString()
        }
        return row;
    }).reverse();
    return (
        <Stack direction={"column"}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Title</TableCell>
                        <TableCell align="right">runTime(m)</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {rows.map((row: Row) => (
                        <TableRow
                            key={row.id}
                            sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                        >
                            <TableCell component="th" scope="row">
                                {row.title}
                            </TableCell>
                            <TableCell align="right">{row.runTime}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </Stack>
    );
}

