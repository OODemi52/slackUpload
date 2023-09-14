import slackLogo from '../assets/Slack_Logo.webp'
import ccLogo from '../assets/CCLOGO-Vector.png'

interface LogoProps {
    org: "ccmd" | "slack"
}

export default function Logo({ org }: LogoProps) {

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
