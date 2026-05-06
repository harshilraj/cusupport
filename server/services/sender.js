export async function sendMessage(user_id, platform, text) {
  console.log("Sending message:", {
    user_id,
    platform,
    text,
  });

  return {
    ok: true,
    provider: "console",
  };
}
