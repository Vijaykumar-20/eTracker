# Build stage
FROM eclipse-temurin:25-jdk-alpine AS build
WORKDIR /app

# Install Maven directly to avoid wrapper (mvnw) permission issues
RUN apk add --no-cache maven

# Limit Maven memory usage
ENV MAVEN_OPTS="-Xmx256m -XX:MaxMetaspaceSize=128m"

# Copy all files
COPY . .

# Build using native mvn command
RUN mvn clean package -DskipTests

# Run stage
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Limit JVM memory in run stage
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]
