declare module "next/config" {
  export default function getConfig(): {
    publicRuntimeConfig: any;
    serverRuntimeConfig: any;
  };
}