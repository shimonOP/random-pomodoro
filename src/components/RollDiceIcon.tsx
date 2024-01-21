import CasinoIcon from '@mui/icons-material/Casino';
import { styled } from '@mui/material';
type RollDiceIconProps = {
  isRolling: boolean
}
const RollDiceIcon = (props: RollDiceIconProps) => {
  const StyledCasinoIcon = styled(CasinoIcon)`
  ${({ theme }) => isRolling ? `
    cursor: pointer;
    animation:0.5s linear infinite rotation;
  @keyframes rotation{
    0%{ transform:rotate(0);}
    100%{ transform:rotate(360deg); }
  }
  ` :
      `
cursor: pointer;
 `
    }
`;
  const { isRolling } = props;
  return (
    <StyledCasinoIcon fontSize='large'></StyledCasinoIcon>
  );
}
export default RollDiceIcon;