import { makeStyles } from '@mui/styles';

export default makeStyles((theme) => ({
  healthCard: {
    color: theme.palette.primary.main,
  },
  card: {
    backgroundColor: theme.palette.common.blueGreenLight,
    border: '5px solid',
    borderColor: 'white',
    borderRadius: '18px',
    boxShadow: '0px 4px 8px #00000080',
    minHeight: '480px',
    padding: '28px 34.5px;',
  },
  cardContent: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0,
    },
  },
  flexRow: {
    marginLeft: '5.5px',
    marginTop: '5px',
  },
  group4: {
    minWidth: '191px',
  },
  overlapGroup: {
    height: '88px',
    position: 'relative',
    width: '193px',
  },
  bitmap: {
    height: '41px',
    left: '2px',
    position: 'absolute',
    top: '0',
    width: '191px',
  },
  title: {
    fontWeight: '300',
    left: '0',
    letterSpacing: '-0.93px',
    position: 'relative',
    textAlign: 'center',
    top: '33px',
  },
  // .group-9
  group9: {
    height: '55px',
    marginBottom: '9.0px',
    marginLeft: '96px',
    minWidth: '465px',
  },
  // .flex-col
  flexCol: {
    minHeight: '55px',
  },
  // .place
  nameLabel: {
    letterSpacing: '0',
    lineHeight: '16px',
    minHeight: '19px',
    whiteSpace: 'nowrap',
  },
  // .anypersonjohn-b
  name: {
    fontWeight: '700',
    letterSpacing: '0',
    lineHeight: '24px',
    minHeight: '27px',
    whiteSpace: 'nowrap',
  },
  // .date-of-birth
  dateOfBirthLabel: {
    letterSpacing: '0',
    lineHeight: '16px',
    minHeight: '19px',
    whiteSpace: 'nowrap',
  },
  dateOfBirth: {
    fontWeight: '700',
    letterSpacing: '0',
    lineHeight: '24px',
    minHeight: '27px',
    whiteSpace: 'nowrap',
  },
  // .eye-outline
  eyeOutline: {
    backgroundSize: '100% 100%',
    color: theme.palette.common.blueGreenDark,
    height: '15px',
    marginBottom: '9px',
    marginLeft: '10px',
    width: '22px',
  },
  // .line
  line: {
    height: '2px',
    marginTop: '5px',
  },
  // .flex-col-2
  flexCol2: {
    marginTop: '10px',
    minHeight: '230px',
    position: 'relative',
  },
  // .group-12
  group12: {
    backgroundColor: 'white',
    borderRadius: '11.5px',
    height: '23px',
    minWidth: '428px',
    padding: '1px',
  },
  // .covid-19-vaccination
  covid19Vaccination: {
    color: 'var(--mako)',
    fontSize: 'var(--font-size-l2)',
    fontWeight: '600',
    letterSpacing: '0',
    minHeight: '19px',
    whiteSpace: 'nowrap',
  },
  // .group-5
  group5: {
    backgroundColor: 'white',
    height: '275px',
    marginLeft: '56px',
    minWidth: '281px',
    padding: '0 18px',
  },
  // .iss-smart-health-car
  issSmartHealthCar: {
    alignSelf: 'flex-end',
    letterSpacing: '0',
    lineHeight: '16px',
    marginLeft: '56px',
    marginTop: '6px',
    minHeight: '19px',
    minWidth: '195px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
  },
  // .group-8
  group8: {
    minHeight: '79px',
    width: '425px',
  },
  // .group-7
  group7: {
    height: '19px',
    width: '100%',
  },
  // .dose
  dose: {
    color: theme.palette.common.blueGreenDark,
    fontWeight: '800',
    letterSpacing: '0',
    lineHeight: '16px',
    minHeight: '19px',
    minWidth: '52px',
    whiteSpace: 'nowrap',
  },
  line2: {
    backgroundColor: theme.palette.common.blueGreenDark,
    height: '2px',
    width: '90%',
  },
  gridRow: {
    alignItems: 'flex-start',
    flexWrap: 'nowrap',
    minHeight: '19px',
    marginTop: '1px',
    minWidth: '182px',
  },
  gridLabel: {
    fontStyle: 'italic',
    fontWeight: '300',
    letterSpacing: '0',
    lineHeight: '16px',
    minHeight: '19px',
    minWidth: '80px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
  },
  gridItem: {
    letterSpacing: '0',
    lineHeight: '16px',
    minHeight: '19px',
    wordWrap: 'break-word',
  },
  date: {
    fontWeight: '700',
  },
  shcText: {
    color: theme.palette.secondary.main,
  },
  bannerError: {
    backgroundColor: theme.palette.common.redLight,
    color: theme.palette.common.redDark,
  },
  topBannerValid: {
    backgroundColor: theme.palette.common.greenLight,
    color: theme.palette.common.greenDark,
  },
  bottomBannerValid: {
    backgroundColor: theme.palette.common.greenLighter,
    color: theme.palette.common.greenDark,
  },
  topBannerPartial: {
    backgroundColor: theme.palette.common.orangeLight,
    color: theme.palette.common.orangeDark,
  },
  bottomBannerPartial: {
    backgroundColor: theme.palette.common.orangeLighter,
    color: theme.palette.common.orangeDark,
  },
  verifiedText: {
    color: theme.palette.common.greenDark,
  },
  unverifiedText: {
    color: theme.palette.common.redDark,
  },
}));
