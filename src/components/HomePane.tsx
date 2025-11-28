import { Stack, Typography } from "@mui/material"
import { useContext } from "react"
import { TLLContext } from '../App';
import CasinoIcon from '@mui/icons-material/Casino';

export function HomePane() {
  const tll = useContext(TLLContext)
  return (
    <Stack>
      <Typography fontWeight={500} fontFamily={["Inter", "BlinkMacSystemFont", "Arial", "sans-serif"]} variant='h5'>Welcome to Random Pomodoro !</Typography>
      <Typography marginTop={2} variant='body2'>{tll.t("HomePaneBody1")}</Typography>
      <Typography marginTop={2} variant='body2' fontWeight={500}>{tll.t("HowToUse")}</Typography>
      <Typography variant='body2'>{tll.t("HowToUse1")}</Typography>
      <Typography variant='body2'>{tll.t("HowToUse2")}<CasinoIcon color="secondary" />{tll.t("HowToUse3")}</Typography>
      <Typography marginTop={2} variant='body2'>{tll.t("HomePaneBody4")}</Typography>
      <Typography variant='body2'>{tll.t("HomePaneBody5")}</Typography>
    </Stack>)
}