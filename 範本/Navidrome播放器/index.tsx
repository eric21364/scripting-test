import { Navigation, Script } from "scripting"

import { NavidromePlayerPage } from "./src/NavidromePlayerPage"

async function run(): Promise<void> {
  try {
    await Navigation.present({
      element: <NavidromePlayerPage />,
      modalPresentationStyle: "fullScreen"
    })
  } finally {
    Script.exit()
  }
}

void run()
