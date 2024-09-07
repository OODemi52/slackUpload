import React from "react";

const SlackAuth: React.FC = () => {

  const handleSignIn = () => {
    const width = 600, height = 600;
    const left = (window.innerWidth - width) / 2;
    const top = (window.innerHeight - height) / 2;
    const url = `https://slack.com/oauth/v2/authorize?client_id=1667223032755.4207899647667&scope=channels:history,channels:read,chat:write,files:read,files:write,groups:history,groups:read,im:read,mpim:read,users:read,users:read.email&user_scope=`;

    window.open(
      url,
      "SignInWithSlack",
      `toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=${width}, height=${height}, top=${top}, left=${left}`
    );
  };

  return (
    <>
      {(
        <button aria-label="Add to Slack">
        <img
          alt="Add to Slack"
          className="slack-button"
          height="40"
          width="139"
          src="https://platform.slack-edge.com/img/add_to_slack.png"
          onClick={handleSignIn}
        />
        </button>
      )}
    </>
  );
};

export default SlackAuth;