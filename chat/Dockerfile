# ==============================================
# STAGE 1: Build
# ==============================================
FROM maven:3.9-eclipse-temurin-17 AS build

WORKDIR /app

# Copiar pom.xml primero para aprovechar el cache de Docker
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copiar el código fuente
COPY src ./src

# Construir la aplicación (sin tests para acelerar)
RUN mvn clean package -DskipTests

# ==============================================
# STAGE 2: Runtime
# ==============================================
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# Instalar herramientas necesarias para healthcheck
RUN apk add --no-cache wget curl

# Copiar el JAR desde el stage de build
COPY --from=build /app/target/*.jar app.jar

# Crear usuario no-root para seguridad
RUN addgroup -S spring && adduser -S spring -G spring
RUN chown spring:spring app.jar

USER spring:spring

# Variables de entorno por defecto (pueden ser sobrescritas)
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -Djava.security.egd=file:/dev/./urandom"

# Exponer puerto
EXPOSE 8080

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/actuator/health || exit 1

# Ejecutar la aplicación
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]