import { makeStyles } from '@mui/styles';

export default makeStyles((theme) => ({
  healthCard: {
    color: theme.palette.primary.main,
    width: '100%',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: theme.palette.common.blueGreenLight,
    border: '5px solid',
    borderColor: 'white',
    borderRadius: '18px',
    boxShadow: '0px 4px 8px #00000080',
    width: '100%',
    minHeight: '480px',
    padding: '28px 34.5px;',
  },
  cardContent: {
    padding: 0,
    '&:last-child': {
      paddingBottom: 0
    }
  },
  flexCol: {
    display: 'flex',
    flexDirection: 'column',
  },
  patientData: {
    alignItems: 'flex-start',
    minHeight: '55px',
  },
  nameLabel: {
    letterSpacing: '0',
    whiteSpace: 'nowrap',
  },
  name: {
    fontWeight: '700',
    wordWrap: 'break-word',
  },
  dateOfBirthRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: '5.5px',
    marginTop: '5px',
  },
  dateOfBirthLabel: {
    letterSpacing: '0',
    whiteSpace: 'nowrap',
  },
  dateOfBirth: {
    fontWeight: '700',
    whiteSpace: 'nowrap',
  },
  eyeOutline: {
    backgroundSize: '100% 100%',
    color: theme.palette.common.blueGreenDark,
    height: '15px',
    marginBottom: '9px',
    marginLeft: '10px',
    width: '22px',
  },
  line: {
    height: '2px',
    marginTop: '5px',
    variant: 'middle',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    height: '19px',
    width: '100%',
  },
  vaccinationRecordBox: {
    alignItems: 'center',
    marginTop: '10px',
    minHeight: '230px',
  },
  vaccinationRecordLabel: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    borderRadius: '11.5px',
    height: '23px',
    width: '100%',
    padding: '1px',
  },
  vaccinationRecordLabelText: {
    color: 'var(--mako)',
    fontSize: 'var(--font-size-l2)',
    fontWeight: '600',
    letterSpacing: '0',
    minHeight: '19px',
    whiteSpace: 'nowrap',
  },
  vaccinationRecordList: {
    width: '100%',
  },
  vaccinationRecordListItem: {
    paddingLeft: '0px',
    paddingRight: '0px',
  },
  vaccinationRoot: {
    minHeight: '79px',
    width: '100%',
    marginLeft: '0px',
  },
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
    variant: 'middle',
  },
  grid: {
    width: '100%',
    marginLeft: '0px',
    paddingLeft: '0px',
    wordWrap: 'break-word',
  },
  gridRow: {
    width: '100%',
    marginLeft: '0px',
    paddingLeft: '0px',
    flexWrap: 'nowrap',
  },
  gridLabel: {
    fontStyle: 'italic',
    fontWeight: '300',
    letterSpacing: '0',
    lineHeight: '16px',
    minHeight: '19px',
    minWidth: '76px',
    textAlign: 'right',
    whiteSpace: 'nowrap',
    marginLeft: '0px',
  },
  gridItem: {
    letterSpacing: '0',
    lineHeight: '16px',
    minHeight: '19px',
    paddingLeft: '2em',
    [theme.breakpoints.down('md')]: {
      paddingLeft: '1em',
    },
  },
  date: {
    fontWeight: '700',
  },
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
}));
