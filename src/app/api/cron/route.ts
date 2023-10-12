import { NextResponse } from "next/server";
import nextBase64 from "next-base64";

import { octokit } from "@/utils/config";

async function getContent() {
  const { data } = await octokit.request(
    "GET /repos/{owner}/{repo}/contents/{path}",
    {
      owner: "devanada",
      repo: "warehouse",
      path: "data.json",
      headers: {
        accept: "application/vnd.github+json",
        "Cache-Control": "no-store",
        "If-Modified-Since": new Date().toISOString(),
      },
    }
  );
  return data;
}

export async function GET() {
  const file = await getContent();
  const { content, sha } = file as any;
  let parsedContent = JSON.parse(nextBase64.decode(content));

  parsedContent.count += 1;
  const encodedContent = nextBase64.encode(JSON.stringify(parsedContent));

  let msgResponse = "";
  let statusResponse = 200;

  try {
    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: "devanada",
      repo: "warehouse",
      path: "data.json",
      message: `feat: initiate cron job #${parsedContent.count}`,
      committer: {
        name: process.env.GITHUB_NAME as string,
        email: process.env.GITHUB_EMAIL as string,
      },
      content: encodedContent,
      sha: sha,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    msgResponse = `Cron job #${parsedContent.count} is successed`;
  } catch (error: any) {
    msgResponse = error.response.data.message;
    statusResponse = error.status;
  }
  return NextResponse.json({ message: msgResponse, status: statusResponse });
}
