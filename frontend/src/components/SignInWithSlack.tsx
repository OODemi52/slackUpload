export const SignInWithSlack = () => {

  const handleSignIn = () => {
    const width = 600, height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    const url = `https://slack.com/oauth/v2/authorize?client_id=1667223032755.4207899647667&scope=channels:read,chat:write,files:read,files:write,groups:read,im:read,mpim:read,users:read&user_scope=`;

    window.open(url, 'SignInWithSlack', `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`);
  };
  
  return (
    <>
        <img
          alt="Add to Slack"
          className="slack-button"
          height="40"
          width="139"
          src="https://platform.slack-edge.com/img/add_to_slack.png"
          srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
          onClick={handleSignIn}
        />
    </>
  );
};