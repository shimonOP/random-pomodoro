import CasinoIcon from '@mui/icons-material/Casino';

type RollDiceIconProps = {
  isRolling: boolean
}

const RollDiceIcon = (props: RollDiceIconProps) => {
  const { isRolling } = props;

  return (
    <div style={{ cursor: 'pointer' }}>
      <CasinoIcon
        fontSize='large'
        style={{
          animation: isRolling ? '0.5s linear infinite rotation' : 'none'
        }}
      />
      <style>{`
        @keyframes rotation {
          0% { transform: rotate(0); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
export default RollDiceIcon;