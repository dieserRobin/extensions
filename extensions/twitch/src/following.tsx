import { ActionPanel, confirmAlert, Detail, getPreferenceValues, List, ListItem, OpenAction } from "@raycast/api";
import React from "react";
import fetch from 'node-fetch';

import Item from "./interfaces/FollowingItem";
import Preferences from "./interfaces/preferences";
import User from "./interfaces/user";

export default function main() {
  const preferences: Preferences = getPreferenceValues();
  const clientId = preferences.clientId;
  const authorization = preferences.authorization;

  const [loading, setLoading] = React.useState(false);
  const [query, setQuery] = React.useState<string>("");
  const [userId, setUserId] = React.useState<string>("");
  const [items, setItems] = React.useState<Item[]>([]);

  React.useEffect(() => {
    setLoading(true);
    fetch(`https://api.twitch.tv/helix/users`, {
      headers: {
        'Client-Id': clientId,
        'Authorization': `Bearer ${authorization}`,
      }
    }).then(res => res.json()).then((data: any) => {
      if (data && data.data) {
        setUserId(data.data[0].id);
      } else if (data.error && data.error.toLowerCase().includes("invalid")) {
        confirmAlert({
          title: "Error",
          message: data.message,
        });
      }
    });
  }, []);

  React.useEffect(() => {
    if (!userId) return;

    fetch(`https://api.twitch.tv/helix/streams/followed?user_id=${userId}`, {
      headers: {
        'Client-Id': clientId,
        'Authorization': `Bearer ${authorization}`,
      }
    }).then(res => res.json()).then((data: any) => {
      if (data && data.data) {
        setItems(data.data);
        setLoading(false);
      } else if (data.error && data.message.toLowerCase().includes("invalid") || data.message.toLowerCase().includes("missing")) {
        confirmAlert({
          title: "Error",
          message: data.message,
        });
      }
    });
  }, [userId]);

  // React.useEffect(() => {
  //   if (query.length == 0) return;
  //   setLoading(true);

  //   fetch(`https://api.twitch.tv/helix/search/channels?query=${query}&live_only=true`, {
  //     headers: {
  //       'Client-Id': clientId,
  //       'Authorization': `Bearer ${authorization}`,
  //     }
  //   }).then(res => res.json()).then((data: any) => {
  //     if (data && data.data) {
  //       setItems(data.data);
  //       setLoading(false);
  //     } else if (data.error && data.error.toLowerCase().includes("invalid")) {
  //       confirmAlert({
  //         title: "Error",
  //         message: data.message,
  //       });
  //     }
  //   });
  // }, [query]);

  return (<>
    <List isLoading={loading} searchBarPlaceholder="Search for a Streamer on Twitch" navigationTitle="Search a Channel" onSearchTextChange={(text) => setQuery(text)}>
      {items.map((item: Item) => {
        return <ListItem key={item.id} icon={item.thumbnail_url.replace("{width}", "1280").replace("{height}", "720")} id={item.id} title={item.title} subtitle={`${item.user_name} - ${item.type == "live" ? `${item.game_name}` : "Offline"}`} actions={
          <ActionPanel>
            <OpenAction title="Open Channel" target={`https://twitch.tv/${item.user_name}`} />
          </ActionPanel>
        } />
      })}
    </List>
  </>)
}
