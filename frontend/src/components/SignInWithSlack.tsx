export const SignInWithSlack = () => {
  return (
    <>
      <a href="https://slack.com/oauth/v2/authorize?client_id=1667223032755.4207899647667&scope=channels:read,chat:write,files:read,files:write,groups:read,im:read,mpim:read,users:read&user_scope=">
        <img
          alt="Add to Slack"
          height="40"
          width="139"
          src="https://platform.slack-edge.com/img/add_to_slack.png"
          srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x"
        />
      </a>
    </>
  );
};