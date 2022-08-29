import process from 'process';
import { PrismaClient } from '@prisma/client';

const client = new PrismaClient()

async function queryForIds(ids?: string[]) {
    await client.$queryRaw`select * from "Test" where id = any (array [${ids}]::uuid[])`
}

async function main() {
    await client.$connect();

    // Switch the order of the following lines and Quaint doesn't throw an error
    await queryForIds(undefined)
    await queryForIds(['256cbed0-67d7-4d23-827c-d6c6c9ff1077'])
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
