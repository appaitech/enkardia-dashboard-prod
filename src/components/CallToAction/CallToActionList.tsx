
import { useState, useEffect } from "react";
import { Bell, EyeOff, Eye, Link, ExternalLink } from "lucide-react";
import { format } from "date-fns";

import { CallToAction } from "@/types/callToAction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { getCallToActionViewCount } from "@/services/callToActionService";

interface CallToActionListProps {
  callToActions: CallToAction[];
  isConsoleView?: boolean;
  onViewCallToAction?: (callToAction: CallToAction) => void;
}

export function CallToActionList({
  callToActions,
  isConsoleView = false,
  onViewCallToAction,
}: CallToActionListProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([]);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Get view counts for console view
    if (isConsoleView && callToActions.length > 0) {
      const fetchViewCounts = async () => {
        const counts: Record<string, number> = {};
        
        await Promise.all(
          callToActions.map(async (cta) => {
            const count = await getCallToActionViewCount(cta.id);
            counts[cta.id] = count;
          })
        );
        
        setViewCounts(counts);
      };
      
      fetchViewCounts();
    }
  }, [callToActions, isConsoleView]);

  // Group call to actions by viewed status for client view
  const groupedCallToActions = !isConsoleView
    ? {
        unviewed: callToActions.filter(cta => !cta.viewed),
        viewed: callToActions.filter(cta => cta.viewed),
      }
    : { all: callToActions };

  if (callToActions.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-10">
            <Bell className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium">No Call To Actions</h3>
            <p className="text-muted-foreground mt-1">
              {isConsoleView
                ? "No call to actions have been created for this client business."
                : "You don't have any call to actions at the moment."}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const renderCallToActions = (items: CallToAction[], title: string) => {
    if (items.length === 0) return null;

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {title === "Unviewed" ? (
              <EyeOff className="h-5 w-5" />
            ) : title === "Viewed" ? (
              <Eye className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
            {title} Call To Actions
          </CardTitle>
          <CardDescription>
            {title === "Unviewed"
              ? "Call to actions you haven't viewed yet"
              : title === "Viewed"
              ? "Call to actions you've already viewed"
              : "All call to actions for this client"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" value={expandedItems} onValueChange={setExpandedItems} className="space-y-4">
            {items.map((cta) => (
              <AccordionItem
                key={cta.id}
                value={cta.id}
                className="border rounded-md px-4"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-1 justify-between items-center">
                    <div className="text-left font-medium">{cta.title}</div>
                    <div className="flex items-center gap-2">
                      {isConsoleView && (
                        <Badge variant="outline" className="ml-2">
                          {viewCounts[cta.id] ?? 0} views
                        </Badge>
                      )}
                      {!isConsoleView && !cta.viewed && (
                        <Badge variant="default" className="bg-blue-500 hover:bg-blue-600">
                          New
                        </Badge>
                      )}
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-2 pb-4">
                  <div className="space-y-4">
                    {cta.description && (
                      <div className="text-sm text-muted-foreground whitespace-pre-line">
                        {cta.description}
                      </div>
                    )}
                    
                    {cta.urls.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Links:</h4>
                        <div className="space-y-2">
                          {cta.urls.map((url) => (
                            <a
                              key={url.id}
                              href={url.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                            >
                              <Link className="h-4 w-4 mr-2" />
                              {url.label || url.url}
                              <ExternalLink className="h-3 w-3 ml-1" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground">
                      Created {format(new Date(cta.createdAt), "PPP")}
                    </div>
                    
                    {!isConsoleView && !cta.viewed && onViewCallToAction && (
                      <Button
                        variant="default"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => {
                          e.preventDefault();
                          onViewCallToAction(cta);
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Mark as Viewed
                      </Button>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    );
  };

  return (
    <div>
      {isConsoleView
        ? renderCallToActions(groupedCallToActions.all, "All")
        : (
          <>
            {renderCallToActions(groupedCallToActions.unviewed, "Unviewed")}
            {renderCallToActions(groupedCallToActions.viewed, "Viewed")}
          </>
        )}
    </div>
  );
}
