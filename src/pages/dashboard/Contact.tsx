import { useEffect, useState } from "react";

import {
  DashboardLayout,
} from "@/components/dashboard/DashboardLayout";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Input,
} from "@/components/ui/input";

import {
  Label,
} from "@/components/ui/label";

import {
  Textarea,
} from "@/components/ui/textarea";

import {
  Button,
} from "@/components/ui/button";

import {
  toast,
} from "@/hooks/use-toast";

import api from "@/lib/axios";

const initialForm = {
  phone: "",
  email: "",
  address: "",
  mapUrl: "",
  hours: "",
};

const Contact = () => {

  // ======================================
  // STATE
  // ======================================
  const [form, setForm] =
    useState(initialForm);

  const [errors, setErrors] =
    useState({});

  const [loading, setLoading] =
    useState(false);

  // ======================================
  // FETCH CONTACT
  // ======================================
  const fetchContact =
    async () => {

      try {

        const res =
          await api.get(
            "/contact"
          );

        if (res.data) {

          setForm({
            phone:
              res.data.phone || "",

            email:
              res.data.email || "",

            address:
              res.data.address || "",

            mapUrl:
              res.data.mapUrl || "",

            hours:
              Array.isArray(
                res.data.hours
              )
                ? res.data.hours.join(
                  "\n"
                )
                : "",
          });
        }

      } catch (error) {

        console.log(
          "Fetch Error:",
          error
        );
      }
    };

  useEffect(() => {
    fetchContact();
  }, []);

  // ======================================
  // HANDLE CHANGE
  // ======================================
  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    // ======================================
    // PHONE
    // FORMAT:
    // +91 8279774869
    // ======================================
    if (name === "phone") {

      // REMOVE INVALID CHARS
      let cleaned =
        value.replace(
          /[^0-9+ ]/g,
          ""
        );

      // ONLY ONE +
      if (
        cleaned.includes("+")
      ) {

        cleaned =
          "+" +
          cleaned
            .replace(/\+/g, "")
            .trim();
      }

      setForm((prev) => ({
        ...prev,
        phone: cleaned,
      }));

      setErrors((prev) => ({
        ...prev,
        phone: "",
      }));

      return;
    }

    // ======================================
    // ADDRESS
    // ======================================
    if (name === "address") {

      setForm((prev) => ({
        ...prev,
        address: value,
      }));

      setErrors((prev) => ({
        ...prev,
        address: "",
      }));

      return;
    }

    // ======================================
    // NORMAL FIELDS
    // ======================================
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    // CLEAR ERRORS
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));
  };

  // ======================================
  // VALIDATION
  // ======================================
  const validateForm = () => {

    const newErrors = {};

    // PHONE
    if (!form.phone.trim()) {

      newErrors.phone =
        "Phone number is required";

    } else if (
      !/^\+\d{1,3}\s\d{10}$/.test(
        form.phone
      )
    ) {

      newErrors.phone =
        "Format should be like +91 8279774869";
    }

    // EMAIL
    if (!form.email.trim()) {

      newErrors.email =
        "Email is required";

    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        form.email
      )
    ) {

      newErrors.email =
        "Invalid email address";
    }

    // ADDRESS
    if (!form.address.trim()) {

      newErrors.address =
        "Office address is required";
    }

    // MAP URL
    if (!form.mapUrl.trim()) {

      newErrors.mapUrl =
        "Map URL is required";

    } else if (
      !/^https?:\/\/.+/.test(
        form.mapUrl
      )
    ) {

      newErrors.mapUrl =
        "Enter valid URL";
    }

    // HOURS
    if (!form.hours.trim()) {

      newErrors.hours =
        "Office hours are required";
    }

    setErrors(newErrors);

    return Object.keys(
      newErrors
    ).length === 0;
  };

  // ======================================
  // SUBMIT
  // ======================================
  const handleSubmit =
    async (e) => {

      e.preventDefault();

      const isValid =
        validateForm();

      if (!isValid) return;

      try {

        setLoading(true);

        await api.put(
          "/contact",
          {
            ...form,

            hours:
              form.hours
                .split("\n")
                .map((h) =>
                  h.trim()
                )
                .filter(Boolean),
          }
        );

        toast({
          title: "Saved",
          description:
            "Contact info updated successfully.",
        });

      } catch (error) {

        console.log(
          "Save Error:",
          error
        );

        toast({
          title: "Error",
          description:
            "Failed to save contact info.",
          variant:
            "destructive",
        });

      } finally {

        setLoading(false);
      }
    };

  return (
    <DashboardLayout title="Contact Details">

      <form
        onSubmit={
          handleSubmit
        }
        className="space-y-6 max-w-4xl"
      >

        <Card className="rounded-2xl border-border">

          {/* HEADER */}
          <CardHeader>

            <CardTitle className="text-lg font-serif">

              Primary Contact Details

            </CardTitle>

          </CardHeader>

          {/* CONTENT */}
          <CardContent className="grid md:grid-cols-2 gap-5">

            {/* PHONE */}
            <div className="space-y-2">

              <Label>
                Phone Number
              </Label>

              <Input
                name="phone"
                placeholder="+91 8279774869"
                value={form.phone}
                onChange={
                  handleChange
                }
                maxLength={16}
              />

              {errors.phone && (
                <p className="text-sm text-red-500">

                  {errors.phone}

                </p>
              )}

            </div>

            {/* EMAIL */}
            <div className="space-y-2">

              <Label>
                Email Address
              </Label>

              <Input
                type="email"
                name="email"
                placeholder="contact@example.com"
                value={form.email}
                onChange={
                  handleChange
                }
              />

              {errors.email && (
                <p className="text-sm text-red-500">

                  {errors.email}

                </p>
              )}

            </div>

            {/* ADDRESS */}
            <div className="md:col-span-2 space-y-2">

              <Label>
                Office Address
              </Label>

              <Textarea
                rows={3}
                name="address"
                placeholder="O-841, 8th Floor, Gaur City Center"
                value={form.address}
                onChange={
                  handleChange
                }
              />

              {errors.address && (
                <p className="text-sm text-red-500">

                  {errors.address}

                </p>
              )}

            </div>

            {/* MAP URL */}
            <div className="md:col-span-2 space-y-2">

              <Label>
                Google Maps Embed URL
              </Label>

              <Input
                name="mapUrl"
                placeholder="https://www.google.com/maps/embed?..."
                value={form.mapUrl}
                onChange={
                  handleChange
                }
              />

              {errors.mapUrl && (
                <p className="text-sm text-red-500">

                  {errors.mapUrl}

                </p>
              )}

            </div>

            {/* HOURS */}
            <div className="md:col-span-2 space-y-2">

              <Label>
                Office Hours
              </Label>

              <Textarea
                rows={5}
                name="hours"
                placeholder={`Mon–Fri: 9:00 – 18:00
Saturday: By appointment
Sunday: Closed`}
                value={form.hours}
                onChange={
                  handleChange
                }
              />

              <p className="text-xs text-muted-foreground">

                Add one schedule per line

              </p>

              {errors.hours && (
                <p className="text-sm text-red-500">

                  {errors.hours}

                </p>
              )}

            </div>

          </CardContent>

        </Card>

        {/* BUTTON */}
        <div className="flex justify-end">

          <Button
            type="submit"
            variant="gold"
            disabled={loading}
            className="min-w-[180px]"
          >

            {loading
              ? "Saving..."
              : "Save Changes"}

          </Button>

        </div>

      </form>

    </DashboardLayout>
  );
};

export default Contact;