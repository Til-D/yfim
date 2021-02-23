import React from "react";
import { Menu, MainButton, ChildButton } from "react-mfb";

var effect = "zoomin",
  pos = "br",
  method = "hover";
export default function ToolBar() {
  return (
    <Menu effect={effect} method={method} position={method}>
      <MainButton iconResting="ion-plus-round" iconActive="ion-close-round" />
      <ChildButton
        //onClick={function(e){ console.log(e); e.preventDefault(); }}
        icon="ion-social-github"
        label="View on Github"
        href="https://github.com/nobitagit/react-material-floating-button/"
      />
      <ChildButton
        icon="ion-social-octocat"
        label="Follow me on Github"
        href="https://github.com/nobitagit"
      />
      <ChildButton
        icon="ion-social-twitter"
        label="Share on Twitter"
        href="http://twitter.com/share?text=Amazing Google Inbox style material floating menu as a React component!&url=http://nobitagit.github.io/react-material-floating-button/&hashtags=material,menu,reactjs,react,component"
      />
    </Menu>
  );
}
