import Head from "next/head";
import Countdown from "../../components/countdownuntil/Countdown";
import { THEME_BOOT_SCRIPT } from "../../components/countdownuntil/params";

export default function CountdownUntilPage() {
  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </Head>
      <script dangerouslySetInnerHTML={{ __html: THEME_BOOT_SCRIPT }} />
      <Countdown />
    </>
  );
}
