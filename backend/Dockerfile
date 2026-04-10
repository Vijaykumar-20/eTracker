# Build stage
FROM eclipse-temurin:25-jdk AS build
WORKDIR /app

# Limit Maven memory usage to fit in Render's free tier (512MB)
ENV MAVEN_OPTS="-Xmx256m -XX:MaxMetaspaceSize=128m"

# Copy all files
COPY . .

# Ensure the maven wrapper is executable
RUN chmod +x mvnw

# Build the application - skip tests to save time and memory
RUN ./mvnw clean package -DskipTests

# Run stage - Use alpine for a smaller image size
FROM eclipse-temurin:25-jre-alpine
WORKDIR /app

# Copy the jar from build stage
COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080

# Limit the JVM memory in the run stage as well
ENTRYPOINT ["java", "-Xmx256m", "-jar", "app.jar"]
