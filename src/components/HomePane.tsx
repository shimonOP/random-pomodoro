import { useContext } from "react"
import { TLLContext } from '../App';
import CasinoIcon from '@mui/icons-material/Casino';

export function HomePane() {
  const tll = useContext(TLLContext)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <h2 className="text-2xl font-medium" style={{ fontFamily: "Inter, BlinkMacSystemFont, Arial, sans-serif" }}>
        Welcome to Random Pomodoro !
      </h2>
      <p className="text-sm" style={{ marginTop: '0.5rem' }}>{tll.t("HomePaneBody1")}</p>
      <p className="text-sm font-medium" style={{ marginTop: '0.5rem' }}>{tll.t("HowToUse")}</p>
      <p className="text-sm">{tll.t("HowToUse1")}</p>
      <p className="text-sm">{tll.t("HowToUse2")}<CasinoIcon color="secondary" />{tll.t("HowToUse3")}</p>
      <p className="text-sm" style={{ marginTop: '0.5rem' }}>{tll.t("HomePaneBody4")}</p>
      <p className="text-sm">{tll.t("HomePaneBody5")}</p>
    </div>)
}