import { NextResponse } from "next/server";
import { Octokit } from "@octokit/core";
import nextBase64 from "next-base64";

import Json from "../data.json";

const octokit = new Octokit({
  // auth: process.env.OCTOKIT_TOKEN,
});

async function getSHA() {
  let result = "";

  try {
    const { data } = await octokit.request(
      "GET /repos/{owner}/{repo}/contents/{path}",
      {
        owner: "devanada",
        repo: "cron-with-nextjs",
        path: "src/app/api/data.json",
        headers: {
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );
    result = (data as any).sha;
  } catch (error: any) {
    result = "";
    console.log(error);
  }

  return result;
}

export async function GET() {
  const newValue = Json.count + 1;
  const newContent = {
    count: newValue,
  };
  const encodedContent = nextBase64.encode(JSON.stringify(newContent));

  let msgResponse = "";
  let statusResponse = 200;

  const shaFile = await getSHA();

  try {
    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: "devanada",
      repo: "cron-with-nextjs",
      path: "src/app/api/data.json",
      message: `feat: initiate cron job #${newValue}`,
      committer: {
        name: process.env.GITHUB_NAME as string,
        email: process.env.GITHUB_EMAIL as string,
      },
      content: encodedContent,
      sha: shaFile,
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
        authorization: `Bearer ${process.env.OCTOKIT_TOKEN}`,
      },
    });
    msgResponse = "Cron job is successed";
  } catch (error: any) {
    msgResponse = error.response.data.message;
    statusResponse = error.status;
  }
  return NextResponse.json({ message: msgResponse, status: statusResponse });
}
