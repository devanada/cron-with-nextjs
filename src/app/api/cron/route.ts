import { NextResponse } from "next/server";
import { Octokit } from "@octokit/core";
import nextBase64 from "next-base64";

import Json from "../data.json";

const octokit = new Octokit({
  auth: process.env.OCTOKIT_TOKEN,
});

export async function GET() {
  let msgResponse = "";
  let statusResponse = 200;

  try {
    const result = await octokit.request(
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
    msgResponse = JSON.stringify(result);
  } catch (error: any) {
    msgResponse = error.response.data.message;
    statusResponse = error.status;
  }

  return NextResponse.json({ message: msgResponse });
}

export async function POST() {
  const newValue = Json.count + 1;
  const newContent = {
    count: newValue,
  };
  const encodedContent = nextBase64.encode(JSON.stringify(newContent));

  let msgResponse = "";
  let statusResponse = 200;

  try {
    await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
      owner: "devanada",
      repo: "cron-with-nextjs",
      path: "src/app/api/data.json",
      message: `feat: push test ${newValue}`,
      committer: {
        name: process.env.GITHUB_NAME as string,
        email: process.env.GITHUB_EMAIL as string,
      },
      content: encodedContent,
      sha: "633d47a56cd1ec921fc243c6f88b1593331bc22f",
      headers: {
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    msgResponse = "Cron job is successed";
  } catch (error: any) {
    msgResponse = error.response.data.message;
    statusResponse = error.status;
  }
  return NextResponse.json({ message: msgResponse, status: statusResponse });
}
