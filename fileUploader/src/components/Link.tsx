export default function Link({ org, componentToBePassed}) {
    
    if (org === "ccmd") {
        
        return (
            <a href="https://christchapelmd.org" target="_blank">
                {componentToBePassed}
            </a>
        ) 
    }

    if (org === "slack") {
       
        return (
            <a href="https://slack.com" target="_blank">
                {componentToBePassed}
            </a>
        ) 
    }
}
