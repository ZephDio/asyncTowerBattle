import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module.js";

const DEFAULT_PORT = 6868;

async function bootstrap() {
	const app = await NestFactory.create(AppModule);
	const port = Number(process.env["PORT"] ?? DEFAULT_PORT);
	await app.listen(port);
}

bootstrap();
