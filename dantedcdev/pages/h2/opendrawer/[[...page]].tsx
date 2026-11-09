import type { GetStaticPaths, GetStaticProps } from "next";
import Head from "next/head";
import Booklet from "../../../components/opendrawer/Booklet";
import { rubik } from "../../../components/opendrawer/font";
import { OPEN_DRAWER, staticPathsFor } from "../../../components/opendrawer/manifest";

export const getStaticPaths: GetStaticPaths = async () => ({
  paths: staticPathsFor(OPEN_DRAWER),
  fallback: false,
});

export const getStaticProps: GetStaticProps = async () => ({ props: {} });

export default function OpenDrawerPage() {
  return (
    <>
      <Head>
        <title>How To: Open Drawer</title>
        <meta name="description" content="Step-by-step instructions for opening the top kitchen drawer." />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
      </Head>
      <Booklet fontClass={rubik.className} manual={OPEN_DRAWER} />
    </>
  );
}
