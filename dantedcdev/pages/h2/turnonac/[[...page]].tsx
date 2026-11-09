import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Booklet from "../../../components/opendrawer/Booklet";
import { rubik } from "../../../components/opendrawer/font";
import { TURN_ON_AC, staticPathsFor } from "../../../components/opendrawer/manifest";

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: staticPathsFor(TURN_ON_AC),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default function TurnOnAcPage() {
  return (
    <>
      <Head>
        <title>How To: Turn On AC</title>
        <meta name="description" content="Step-by-step instructions for turning on the AC." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Booklet fontClass={rubik.className} manual={TURN_ON_AC} />
    </>
  );
}
