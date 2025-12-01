import React, { useContext, useMemo, useState } from 'react';
import { Box, Card, CardContent, FormControl, MenuItem, Paper, Select, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';

import { TLLContext } from '../App';
import { extractTime } from '../util';
import { useDiceTodoStates } from '../contexts/DiceTodoContext';


type MonthlyStats = {
    year: number;
    month: number;
    totalMinutes: number;
    totalHours: number;
    taskCount: number;
};

type TaskStats = {
    title: string;
    count: number;
    totalMinutes: number;
    totalHours: number;
};

const StatsPane = () => {
    const { records } = useDiceTodoStates();
    const tll = useContext(TLLContext);
    const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
    const [selectedMonth, setSelectedMonth] = useState<number | 'all'>('all');

    // 月ごとの統計を計算
    const monthlyStats = useMemo(() => {
        const statsMap = new Map<string, MonthlyStats>();

        records.forEach(record => {
            const date = new Date(record.createdAt);
            const year = date.getFullYear();
            const month = date.getMonth() + 1; // 0-11 -> 1-12
            const key = `${year}-${month}`;

            if (!statsMap.has(key)) {
                statsMap.set(key, {
                    year,
                    month,
                    totalMinutes: 0,
                    totalHours: 0,
                    taskCount: 0,
                });
            }

            const stats = statsMap.get(key)!;
            const minutes = extractTime(record.runTime, 'seconds', 'minutes');
            stats.totalMinutes += minutes;
            stats.totalHours = Math.floor(stats.totalMinutes / 60);
            stats.taskCount += 1;
        });

        return Array.from(statsMap.values()).sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
        });
    }, [records]);

    // 利用可能な年のリストを取得
    const availableYears = useMemo(() => {
        const years = new Set<number>();
        monthlyStats.forEach(stat => years.add(stat.year));
        return Array.from(years).sort((a, b) => b - a);
    }, [monthlyStats]);

    // フィルタリングされたレコード
    const filteredRecords = useMemo(() => {
        return records.filter(record => {
            const date = new Date(record.createdAt);
            const year = date.getFullYear();
            const month = date.getMonth() + 1;

            if (selectedYear !== 'all' && year !== selectedYear) return false;
            if (selectedMonth !== 'all' && month !== selectedMonth) return false;

            return true;
        });
    }, [records, selectedYear, selectedMonth]);

    // タスクごとの統計を計算
    const taskStats = useMemo(() => {
        const statsMap = new Map<string, TaskStats>();

        filteredRecords.forEach(record => {
            const title = record.titles.join(' / ') || 'Untitled';

            if (!statsMap.has(title)) {
                statsMap.set(title, {
                    title,
                    count: 0,
                    totalMinutes: 0,
                    totalHours: 0,
                });
            }

            const stats = statsMap.get(title)!;
            const minutes = extractTime(record.runTime, 'seconds', 'minutes');
            stats.count += 1;
            stats.totalMinutes += minutes;
            stats.totalHours = Math.floor(stats.totalMinutes / 60);
        });

        return Array.from(statsMap.values()).sort((a, b) => b.totalMinutes - a.totalMinutes);
    }, [filteredRecords]);

    // 合計統計
    const totalStats = useMemo(() => {
        const totalSeconds = filteredRecords.reduce((sum, record) => sum + record.runTime, 0);
        const totalMinutes = extractTime(totalSeconds, 'seconds', 'minutes');
        const totalHours = extractTime(totalSeconds, 'seconds', 'hours');

        return {
            count: filteredRecords.length,
            totalMinutes,
            totalHours,
        };
    }, [filteredRecords]);

    return (
        <Stack spacing={2} padding={2}>
            <Typography variant="h5">Statistics</Typography>

            {/* フィルター */}
            <Stack direction="row" spacing={2} alignItems="center">
                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value === 'all' ? 'all' : Number(e.target.value));
                            setSelectedMonth('all');
                        }}
                    >
                        <MenuItem value="all">All Years</MenuItem>
                        {availableYears.map(year => (
                            <MenuItem key={year} value={year}>{year}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                        disabled={selectedYear === 'all'}
                    >
                        <MenuItem value="all">All Months</MenuItem>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(month => (
                            <MenuItem key={month} value={month}>{month}{tll.t("Month")}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Stack>

            {/* 合計統計カード */}
            <Card>
                <CardContent>
                    <Typography variant="h6" gutterBottom>
                        {selectedYear !== 'all' && selectedMonth !== 'all'
                            ? `${selectedYear}${tll.t("Year")} ${selectedMonth}${tll.t("Month")}`
                            : selectedYear !== 'all'
                                ? `${selectedYear}${tll.t("Year")}`
                                : tll.t("Total")}
                    </Typography>
                    <Stack direction="row" spacing={4}>
                        <Box>
                            <Typography color="textSecondary">Tasks</Typography>
                            <Typography variant="h4">{totalStats.count}</Typography>
                        </Box>
                        <Box>
                            <Typography color="textSecondary">{tll.t("Total")} {tll.t("Hour")}</Typography>
                            <Typography variant="h4">{totalStats.totalHours}{tll.t("H")}</Typography>
                        </Box>
                    </Stack>
                </CardContent>
            </Card>

            {/* 月ごとの統計チャート */}
            {selectedYear === 'all' && selectedMonth === 'all' && monthlyStats.length > 0 && (
                <Box>
                    <Typography variant="h6" gutterBottom>Monthly Summary</Typography>
                    <TableContainer component={Paper} sx={{ mt: 2 }}>
                        <Table size="small">
                            <TableHead>
                                <TableRow>
                                    <TableCell>{tll.t("Year")}/{tll.t("Month")}</TableCell>
                                    <TableCell align="right">Tasks</TableCell>
                                    <TableCell align="right">{tll.t("Hour")}</TableCell>
                                    <TableCell align="right">{tll.t("Min")}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {monthlyStats.slice().reverse().map((stat) => (
                                    <TableRow key={`${stat.year}-${stat.month}`}>
                                        <TableCell>{stat.year}/{stat.month}</TableCell>
                                        <TableCell align="right">{stat.taskCount}</TableCell>
                                        <TableCell align="right">{stat.totalHours}{tll.t("H")}</TableCell>
                                        <TableCell align="right">{stat.totalMinutes % 60}{tll.t("M")}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            {/* タスクごとの統計テーブル */}
            <Box>
                <Typography variant="h6" gutterBottom>Tasks Statistics</Typography>
                <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                    <Table size="small" stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell>Task</TableCell>
                                <TableCell align="right">Count</TableCell>
                                <TableCell align="right">{tll.t("Hour")}</TableCell>
                                <TableCell align="right">{tll.t("Min")}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {taskStats.map((stat, index) => (
                                <TableRow key={index}>
                                    <TableCell>{stat.title}</TableCell>
                                    <TableCell align="right">{stat.count}</TableCell>
                                    <TableCell align="right">{stat.totalHours}{tll.t("H")}</TableCell>
                                    <TableCell align="right">{stat.totalMinutes % 60}{tll.t("M")}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>
        </Stack>
    );
};

export default StatsPane;
