import slackLogo from '../assets/Slack_Logo.webp'
import ccLogo from '../assets/CCLOGO-Vector.png'


export default function Logo({ org }) {

    if (org === "ccmd") {
        return(
            <>
                <img src={ccLogo} className="logo" alt="Christ Chapel Logo" />
            </>
        )
    }
    if (org === "slack") {
        return(
            <>
                <img src={slackLogo} className="logo react" alt="Slack Logo" />
            </>
        )
    }
}
