import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Briefcase, GraduationCap, Building2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden py-24 md:py-32 lg:py-40">
        <div className="absolute inset-0 z-0 text-balance">
          <img
            src="/site-image.JPG"
            alt="University of Ruhuna"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 md:bg-white/60 dark:md:bg-zinc-950/50 backdrop-blur-[2px]" />
        </div>

        <div className="container relative z-10 px-4 md:px-6 flex flex-col items-center text-center space-y-8">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-background/80 px-3 py-1 text-sm font-medium text-primary backdrop-blur-sm shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
            UOR Faculty of Technology
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl text-foreground drop-shadow-sm">
            Launch Your Career with the Perfect{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-indigo-600 dark:from-primary dark:to-blue-400">
              Internship
            </span>
          </h1>

          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8 font-medium text-balance">
            Connect with alumni, academic staff, and top companies. Apply for exclusive opportunities and kickstart your professional journey right from your campus.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <Link href="/auth/register?role=student">
              <Button size="lg" className="w-full sm:w-auto font-semibold group">
                I'm a Student
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="/auth/register?role=external">
              <Button size="lg" variant="outline" className="w-full sm:w-auto font-semibold">
                I'm an Alumnus / Lecturer / External Partner
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/50">
        <div className="container px-4 md:px-6">
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="flex flex-col items-center text-center space-y-4 p-8 bg-card rounded-2xl shadow-sm border border-border/50 transition-all hover:shadow-md hover:border-primary/50 hover:-translate-y-1">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-inner">
                <GraduationCap className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold italic tracking-tight">For Undergraduates</h3>
              <p className="text-muted-foreground leading-relaxed">
                Create your profile, showcase your skills, and easily apply to multiple internships tailored for FOT students.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 p-8 bg-card rounded-2xl shadow-sm border border-border/50 transition-all hover:shadow-md hover:border-blue-500/50 hover:-translate-y-1">
              <div className="h-16 w-16 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-inner">
                <Building2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold italic tracking-tight">For Companies</h3>
              <p className="text-muted-foreground leading-relaxed">
                Post opportunities, manage applications, and discover the brightest upcoming tech talent from the university.
              </p>
            </div>

            <div className="flex flex-col items-center text-center space-y-4 p-8 bg-card rounded-2xl shadow-sm border border-border/50 transition-all hover:shadow-md hover:border-indigo-500/50 hover:-translate-y-1">
              <div className="h-16 w-16 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-500 shadow-inner">
                <Briefcase className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold italic tracking-tight">Seamless Process</h3>
              <p className="text-muted-foreground leading-relaxed">
                A streamlined platform bridging the gap between university talent and industry needs. Easily view or post internship opportunities in one centralized system.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
